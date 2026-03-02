import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CateringOrderStatus {
    PENDING = 'pending',
    REVIEWING = 'reviewing',
    QUOTED = 'quoted',
    CONFIRMED = 'confirmed',
    PAID = 'paid',
    PREPARING = 'preparing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

// Snapshot of a single selected item at order time
@Schema({ _id: false })
export class SelectedItem {
    @Prop({ required: true })
    itemName: string;

    @Prop()
    choiceName: string;

    @Prop({ required: true, type: Number })
    price: number; // per-person price for this item (basePrice + choiceModifier)
}
export const SelectedItemSchema = SchemaFactory.createForClass(SelectedItem);

// Snapshot of customer selections per category
@Schema({ _id: false })
export class CategorySelection {
    @Prop({ required: true })
    categoryName: string;

    @Prop({ type: [SelectedItemSchema], required: true })
    selectedItems: SelectedItem[];
}
export const CategorySelectionSchema = SchemaFactory.createForClass(CategorySelection);

@Schema({ timestamps: true })
export class CateringOrder extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'CateringPackage', required: true })
    packageId: Types.ObjectId;

    @Prop({ required: true })
    packageName: string; // snapshot at order time

    @Prop({ type: [CategorySelectionSchema], required: true })
    selections: CategorySelection[];

    @Prop({ required: true, type: Number })
    guests: number;

    @Prop({ required: true })
    eventDate: Date;

    @Prop()
    eventLocation: string;

    @Prop({ required: true, type: Number })
    pricePerPerson: number;

    @Prop({ required: true, type: Number })
    totalPrice: number;

    @Prop({ type: Object, required: true })
    customerInfo: {
        name: string;
        email: string;
        phone: string;
        notes?: string;
    };

    @Prop({ type: String, enum: CateringOrderStatus, default: CateringOrderStatus.PENDING })
    status: CateringOrderStatus;

    @Prop({ default: 'unpaid' })
    paymentStatus: string;

    @Prop()
    stripeSessionId: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const CateringOrderSchema = SchemaFactory.createForClass(CateringOrder);
