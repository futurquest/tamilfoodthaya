import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class MenuItem extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ required: true, type: Number })
    price: number;

    @Prop()
    image: string;

    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    categoryId: Types.ObjectId;

    @Prop({ type: Number, min: 0, max: 3, default: 0 })
    spiceLevel: number;

    @Prop({ default: true })
    available: boolean;

    @Prop({ default: 0 })
    stockCount: number;

    @Prop({ default: true })
    dailyAvailability: boolean;

    @Prop({ default: true })
    isActive: boolean;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
