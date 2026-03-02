import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ChangeRequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class ChangeRequest extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'CateringOrder', required: true })
    orderId: Types.ObjectId;

    @Prop({ required: true })
    requestedChanges: string;

    @Prop({ type: String, enum: ChangeRequestStatus, default: ChangeRequestStatus.PENDING })
    status: ChangeRequestStatus;

    @Prop()
    adminNotes?: string;
}

export const ChangeRequestSchema = SchemaFactory.createForClass(ChangeRequest);
