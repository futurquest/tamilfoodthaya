import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderEntity, OrderStatus } from './entities/order.entity';
import { MenuItemEntity } from '../menu/entities/menu-item.entity';
import { PaymentGatewayFactory } from './payment/payment.factory';

@Injectable()
export class OrderService {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        @InjectRepository(OrderEntity) private orderRepo: Repository<OrderEntity>,
        @InjectRepository(MenuItemEntity) private menuItemRepo: Repository<MenuItemEntity>,
        private paymentGatewayFactory: PaymentGatewayFactory,
        private configService: ConfigService,
        private eventEmitter: EventEmitter2,
    ) { }

    async createCheckoutSession(orderData: any) {
        if (!Array.isArray(orderData?.items) || orderData.items.length === 0 || orderData.items.length > 50) {
            throw new BadRequestException('Order must contain 1–50 items');
        }
        return this.dataSource.transaction(async (manager) => {
            // 0. Validate Stock & re-derive prices from the DB (never trust client prices/names)
            for (const item of orderData.items) {
                if (!item || typeof item.menuItemId !== 'string') throw new BadRequestException('Invalid order item');
                const menuItem = await manager.findOne(MenuItemEntity, { where: { _id: item.menuItemId } });
                if (!menuItem || !menuItem.isActive || !menuItem.available || !menuItem.dailyAvailability) {
                    throw new NotFoundException(`Menu item not found: ${item.menuItemId}`);
                }
                const quantity = Number(item.quantity);
                if (!Number.isInteger(quantity) || quantity < 1) {
                    throw new BadRequestException(`Invalid quantity for ${menuItem.name}`);
                }
                if (menuItem.stockCount < quantity) {
                    throw new BadRequestException(`Not enough stock for ${menuItem.name}. Available: ${menuItem.stockCount}`);
                }
                if (!Number.isFinite(menuItem.price) || menuItem.price < 0) throw new BadRequestException('Invalid menu price');
                item.quantity = quantity;
                item.price = menuItem.price;
                item.name = menuItem.name;
            }
            orderData.total = Math.round(orderData.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0) * 100) / 100;

            // 1. Create a pending order in DB
            const savedOrder = await manager.save(manager.create(OrderEntity, {
                _id: OrderEntity.newId(),
                userId: orderData.userId ?? null,
                items: orderData.items,
                total: orderData.total,
                status: OrderStatus.PENDING,
                paymentStatus: 'unpaid',
                pickupTime: new Date(orderData.pickupTime),
                customerInfo: orderData.customerInfo,
                utmSource: orderData.utmSource ?? null,
                couponCode: orderData.couponCode ?? null,
            }));

            // 2. Delegate to Payment Strategy
            const methodType = orderData.paymentMethod || 'stripe';
            const gateway = this.paymentGatewayFactory.getStrategy(methodType);
            const checkoutResult = await gateway.createCheckoutSession(orderData, {
                orderId: savedOrder._id,
            });
            savedOrder.stripeSessionId = checkoutResult.sessionId;
            await manager.save(savedOrder);

            return { url: checkoutResult.url };
        });
    }

    async handleWebhook(method: string, sig: string, payload: any) {
        let event;
        try {
            const gateway = this.paymentGatewayFactory.getStrategy(method);
            event = await gateway.validateWebhook(sig, payload);
        } catch (err: any) {
            throw new Error(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const sessionData = event.data.object as any;
            const orderId = sessionData.metadata?.orderId;

            if (orderId) {
                await this.dataSource.transaction(async (manager) => {
                    const order = await manager.findOne(OrderEntity, { where: { _id: orderId } });
                    if (!order) {
                        return;
                    }

                    order.status = OrderStatus.PAID;
                    order.paymentStatus = 'paid';
                    await manager.save(order);

                    // Reduce Stock
                    for (const item of order.items) {
                        await manager.increment(MenuItemEntity, { _id: item.menuItemId }, 'stockCount', -item.quantity);
                    }

                    this.eventEmitter.emit('order.status.changed', {
                        orderId: order._id,
                        userId: order.userId ?? null,
                        customerEmail: order.customerInfo.email,
                        customerPhone: order.customerInfo.phone,
                        customerName: order.customerInfo.name,
                        oldStatus: OrderStatus.PENDING,
                        newStatus: OrderStatus.PAID,
                        orderType: 'regular',
                    });
                });
                console.log(`Order ${orderId} confirmed and stock updated.`);
            }
        }

        return { received: true };
    }

    async getOrderById(id: string, user?: any) {
        const order = await this.orderRepo.findOne({ where: { _id: id } });
        if (!order || !order.isActive) {
            throw new NotFoundException(`Order not found: ${id}`);
        }
        const isAdmin = user?.role === 'admin' || user?.role === 'staff';
        if (!isAdmin && order.userId !== user?._id) {
            throw new NotFoundException(`Order not found: ${id}`);
        }
        return order;
    }

    async getOrders(filters: any): Promise<any> {
        const page = filters.page ? parseInt(filters.page, 10) : 1;
        const limit = filters.limit ? parseInt(filters.limit, 10) : 20;
        const skip = (page - 1) * limit;

        const where: any = { isActive: true };

        if (filters.status) where.status = filters.status;
        if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

        if (filters.from) where.createdAt = MoreThanOrEqual(new Date(filters.from));
        if (filters.to) {
            where.createdAt = where.createdAt
                ? (where.createdAt as any).and(LessThanOrEqual(new Date(filters.to)))
                : LessThanOrEqual(new Date(filters.to));
        }

        const [data, total] = await this.orderRepo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return { data, total, page, limit };
    }

    async updateOrderStatus(id: string, newStatus: OrderStatus): Promise<OrderEntity> {
        if (!Object.values(OrderStatus).includes(newStatus)) {
            throw new BadRequestException(`Invalid order status: ${newStatus}`);
        }
        const order = await this.orderRepo.findOne({ where: { _id: id } });
        if (!order) {
            throw new NotFoundException(`Order not found: ${id}`);
        }

        const oldStatus = order.status;
        order.status = newStatus;
        await this.orderRepo.save(order);

        this.eventEmitter.emit('order.status.changed', {
            orderId: order._id,
            userId: order.userId ?? null,
            customerEmail: order.customerInfo.email,
            customerPhone: order.customerInfo.phone,
            customerName: order.customerInfo.name,
            oldStatus: oldStatus,
            newStatus: order.status,
            orderType: 'regular',
        });

        return order;
    }
}
