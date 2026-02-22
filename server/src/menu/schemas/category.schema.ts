import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum CategoryType {
    VEG = 'Veg',
    NON_VEG = 'Non-Veg',
    DRINKS = 'Drinks',
    FOOD = 'food',
    BEVERAGE = 'beverage',
}

@Schema({ timestamps: true })
export class Category extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ type: String, enum: CategoryType, default: CategoryType.VEG })
    type: CategoryType;

    @Prop({ default: 0 })
    order: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
