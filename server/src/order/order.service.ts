import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderStatus } from './schemas/order.schema';
import { MenuItem } from '../menu/schemas/menu-item.schema';
import { PaymentGatewayFactory } from './payment/payment.factory';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItem>,
        @InjectConnection() private connection: Connection,
        private paymentGatewayFactory: PaymentGatewayFactory,
        private configService: ConfigService,
        private eventEmitter: EventEmitter2,
    ) { }

    async createCheckoutSession(orderData: any) {
        const session = await this.connection.startSession();
        let url: string = '';

        await session.withTransaction(async () => {
            // 0. Validate Stock
            for (const item of orderData.items) {
                const menuItem = await this.menuItemModel.findById(item.menuItemId).session(session);
                if (!menuItem) {
                    throw new NotFoundException(`Menu item not found: ${item.menuItemId}`);
                }
                if (menuItem.stockCount < item.quantity) {
                    throw new BadRequestException(`Not enough stock for ${menuItem.name}. Available: ${menuItem.stockCount}`);
                }
            }

            // 1. Create a pending order in DB
            const [savedOrder] = await this.orderModel.create([{
                ...orderData,
                status: OrderStatus.PENDING,
                paymentStatus: 'unpaid',
            }], { session });

            // 2. Delegate to Payment Strategy
            const methodType = orderData.paymentMethod || 'stripe';
            const gateway = this.paymentGatewayFactory.getStrategy(methodType);
            const checkoutResult = await gateway.createCheckoutSession(orderData, {
                orderId: savedOrder._id.toString(),
            });
            url = checkoutResult.url;

            // 3. Update order with session ID
            savedOrder.stripeSessionId = checkoutResult.sessionId;
            await savedOrder.save({ session });
        });

        session.endSession();
        return { url };
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
            // Safe access using Optional Chaining or Type Assertion if needed
            const sessionData = event.data.object as any;
            const orderId = sessionData.metadata?.orderId;

            if (orderId) {
                const session = await this.connection.startSession();
                await session.withTransaction(async () => {
                    const order = await this.orderModel.findByIdAndUpdate(orderId, {
                        status: OrderStatus.PAID,
                        paymentStatus: 'paid',
                    }, { new: true, session });

                    // Reduce Stock
                    if (order) {
                        for (const item of order.items) {
                            await this.menuItemModel.findByIdAndUpdate(item.menuItemId, {
                                $inc: { stockCount: -item.quantity }
                            }, { session });
                        }

                        this.eventEmitter.emit('order.status.changed', {
                            orderId: order._id.toString(),
                            userId: order.userId?.toString(),
                            customerEmail: order.customerInfo.email,
                            customerPhone: order.customerInfo.phone,
                            customerName: order.customerInfo.name,
                            oldStatus: OrderStatus.PENDING,
                            newStatus: OrderStatus.PAID,
                            orderType: 'regular',
                        });
                    }
                });
                session.endSession();
                console.log(`Order ${orderId} confirmed and stock updated.`);
            }
        }

        return { received: true };
    }

    async getOrderById(id: string) {
        const order = await this.orderModel.findById(id).exec();
        if (!order || !order.isActive) {
            throw new NotFoundException(`Order not found: ${id}`);
        }
        return order;
    }

    async getOrders(filters: any): Promise<any> {
        const query: any = { isActive: true, ...filters };

        // Remove pagination keys from raw query to avoid mongo errors
        delete query.page;
        delete query.limit;
        delete query.from;
        delete query.to;

        if (filters.from || filters.to) {
            query.createdAt = {};
            if (filters.from) query.createdAt.$gte = new Date(filters.from);
            if (filters.to) query.createdAt.$lte = new Date(filters.to);
        }

        const page = filters.page ? parseInt(filters.page, 10) : 1;
        const limit = filters.limit ? parseInt(filters.limit, 10) : 20;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.orderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.orderModel.countDocuments(query).exec(),
        ]);

        return { data, total, page, limit };
    }

    async updateOrderStatus(id: string, newStatus: OrderStatus): Promise<Order> {
        const order = await this.orderModel.findById(id).exec();
        if (!order) {
            throw new NotFoundException(`Order not found: ${id}`);
        }

        const oldStatus = order.status;
        order.status = newStatus;
        await order.save();

        this.eventEmitter.emit('order.status.changed', {
            orderId: order._id.toString(),
            userId: order.userId?.toString(),
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
