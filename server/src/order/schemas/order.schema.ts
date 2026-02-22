import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    PREPARING = 'preparing',
    READY = 'ready',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Order extends Document {
    @Prop({ required: true, type: [{ menuItemId: Types.ObjectId, name: String, quantity: Number, price: Number, spiceLevel: Number }] })
    items: any[];

    @Prop({ required: true, type: Number })
    total: number;

    @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Prop({ required: true })
    pickupTime: Date;

    @Prop({ type: Object, required: true })
    customerInfo: {
        name: string;
        email: string;
        phone: string;
        notes?: string;
    };

    @Prop({ default: 'unpaid' })
    paymentStatus: string;

    @Prop()
    stripeSessionId: string;

    @Prop()
    utmSource: string;

    @Prop()
    couponCode: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
