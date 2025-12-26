import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Order, OrderStatus } from './schemas/order.schema';
import { MenuItem } from '../menu/schemas/menu-item.schema';
import { PaymentGateway } from './payment/payment.interface';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItem>,
        private paymentGateway: PaymentGateway,
        private configService: ConfigService,
    ) { }

    async createCheckoutSession(orderData: any) {
        // 0. Validate Stock
        for (const item of orderData.items) {
            const menuItem = await this.menuItemModel.findById(item.menuItemId);
            if (!menuItem) {
                throw new NotFoundException(`Menu item not found: ${item.menuItemId}`);
            }
            if (menuItem.stockCount < item.quantity) {
                throw new BadRequestException(`Not enough stock for ${menuItem.name}. Available: ${menuItem.stockCount}`);
            }
        }

        // 1. Create a pending order in DB
        const newOrder = new this.orderModel({
            ...orderData,
            status: OrderStatus.PENDING,
            paymentStatus: 'unpaid',
        });
        const savedOrder = await newOrder.save();

        // 2. Delegate to Payment Strategy
        const { url, sessionId } = await this.paymentGateway.createCheckoutSession(orderData, {
            orderId: savedOrder._id.toString(),
        });

        // 3. Update order with session ID
        savedOrder.stripeSessionId = sessionId;
        await savedOrder.save();

        return { url };
    }

    async handleWebhook(sig: string, payload: any) {
        let event;
        try {
            event = await this.paymentGateway.validateWebhook(sig, payload);
        } catch (err: any) {
            throw new Error(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            // Safe access using Optional Chaining or Type Assertion if needed
            const session = event.data.object as any;
            const orderId = session.metadata?.orderId;

            if (orderId) {
                const order = await this.orderModel.findByIdAndUpdate(orderId, {
                    status: OrderStatus.PAID,
                    paymentStatus: 'paid',
                }, { new: true });

                // Reduce Stock
                if (order) {
                    for (const item of order.items) {
                        await this.menuItemModel.findByIdAndUpdate(item.menuItemId, {
                            $inc: { stockCount: -item.quantity }
                        });
                    }
                }

                console.log(`Order ${orderId} confirmed and stock updated.`);
            }
        }

        return { received: true };
    }

    async getOrders(filters: any) {
        return this.orderModel.find(filters).sort({ createdAt: -1 }).exec();
    }
}
