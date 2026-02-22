import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// --- Embedded Sub-Schemas ---

@Schema({ _id: false })
export class CateringChoice {
    @Prop({ required: true })
    name: string;

    @Prop({ type: Number, default: 0 })
    priceModifier: number; // additional cost per person, e.g. +€2
}
export const CateringChoiceSchema = SchemaFactory.createForClass(CateringChoice);

@Schema({ _id: false })
export class CateringItem {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ type: Number, default: 0 })
    basePrice: number; // per-person contribution

    @Prop({ type: [CateringChoiceSchema], default: [] })
    choices: CateringChoice[];
}
export const CateringItemSchema = SchemaFactory.createForClass(CateringItem);

@Schema({ _id: false })
export class CateringCategory {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ type: Number, default: 1 })
    minSelect: number; // minimum items customer must select

    @Prop({ type: Number, default: 1 })
    maxSelect: number; // maximum items customer can select

    @Prop({ type: [CateringItemSchema], default: [] })
    items: CateringItem[];
}
export const CateringCategorySchema = SchemaFactory.createForClass(CateringCategory);

// --- Main Package Schema ---

@Schema({ timestamps: true })
export class CateringPackage extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ required: true, type: Number })
    basePrice: number; // base price per person

    @Prop({ required: true, type: Number })
    minGuests: number;

    @Prop({ type: Number })
    maxGuests: number;

    @Prop({ type: [CateringCategorySchema], default: [] })
    categories: CateringCategory[];

    @Prop()
    image: string;

    @Prop({ default: true })
    available: boolean;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: Number, default: 0 })
    sortOrder: number;
}

export const CateringPackageSchema = SchemaFactory.createForClass(CateringPackage);
