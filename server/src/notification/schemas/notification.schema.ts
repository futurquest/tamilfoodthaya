import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationStatus {
    PENDING = 'pending',
    SENT = 'sent',
    FAILED = 'failed',
}

@Schema({ timestamps: true })
export class NotificationLog extends Document {
    @Prop({ required: true })
    eventId: string; // Used for idempotency (e.g., orderId_status)

    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId })
    referenceId?: Types.ObjectId; // E.g., Order ID

    @Prop({ required: true })
    type: string; // 'email' | 'whatsapp'

    @Prop({ required: true, type: String, enum: NotificationStatus, default: NotificationStatus.PENDING })
    status: NotificationStatus;

    @Prop()
    errorMessage?: string;

    @Prop({ type: Object })
    payload: any; // What was sent

    @Prop({ default: false })
    isCleared: boolean;
}

export const NotificationLogSchema = SchemaFactory.createForClass(NotificationLog);
// Index for idempotency checks
NotificationLogSchema.index({ eventId: 1, type: 1 }, { unique: true });
