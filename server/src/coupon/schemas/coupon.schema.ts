import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Coupon extends Document {
    @Prop({ required: true, unique: true, uppercase: true, trim: true })
    code: string;

    @Prop({ type: String, enum: ['percentage', 'fixed'], default: 'percentage' })
    discountType: 'percentage' | 'fixed';

    @Prop({ required: true, min: 0, type: Number })
    discountValue: number;

    @Prop({ default: 0, type: Number })
    minOrderAmount: number;

    @Prop({ default: 0, type: Number }) // 0 = unlimited
    maxUses: number;

    @Prop({ default: 0, type: Number })
    usedCount: number;

    @Prop({ type: Date, default: null })
    validFrom: Date;

    @Prop({ type: Date, default: null })
    validUntil: Date;

    @Prop({ default: true })
    isActive: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
