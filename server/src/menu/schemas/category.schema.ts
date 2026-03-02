import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum CategoryType {
    VEG = 'Veg',
    NON_VEG = 'Non-Veg',
    DRINKS = 'Drinks',
    FOOD = 'food',
    BEVERAGE = 'beverage',
}

import { TranslatedText, TranslatedTextSchema } from '../../common/schemas/translated-text.schema';

@Schema({ timestamps: true })
export class Category extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ type: TranslatedTextSchema })
    nameTranslations?: TranslatedText;

    @Prop({ type: String, enum: CategoryType, default: CategoryType.VEG })
    type: CategoryType;

    @Prop({ default: 0 })
    order: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
