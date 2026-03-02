import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TranslatedText, TranslatedTextSchema } from '../../common/schemas/translated-text.schema';

export type PricingType = 'fixed' | 'per_person';
export type AddonCategory = 'decoration' | 'entertainment' | 'service' | 'extra_time' | 'other';

@Schema({ timestamps: true })
export class Addon extends Document {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ type: TranslatedTextSchema })
    nameTranslations?: TranslatedText;

    @Prop({ default: '' })
    description: string;

    @Prop({ type: TranslatedTextSchema })
    descriptionTranslations?: TranslatedText;

    @Prop({ required: true, min: 0, type: Number })
    price: number;

    @Prop({ type: String, enum: ['fixed', 'per_person'], default: 'fixed' })
    pricingType: PricingType;

    @Prop({ type: String, default: 'other' })
    category: AddonCategory;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: 0, type: Number })
    sortOrder: number;
}

export const AddonSchema = SchemaFactory.createForClass(Addon);
