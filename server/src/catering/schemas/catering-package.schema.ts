import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// --- Embedded Sub-Schemas ---

import { Types } from 'mongoose';
import { TranslatedText, TranslatedTextSchema } from '../../common/schemas/translated-text.schema';

@Schema({ _id: false })
export class CateringItem {
    @Prop({ type: Types.ObjectId, ref: 'MenuItem', required: true })
    menuItem: Types.ObjectId;
}
export const CateringItemSchema = SchemaFactory.createForClass(CateringItem);

@Schema({ _id: false })
export class CateringCategory {
    @Prop({ required: true })
    name: string;

    @Prop({ type: TranslatedTextSchema })
    nameTranslations?: TranslatedText;

    @Prop()
    description: string;

    @Prop({ type: TranslatedTextSchema })
    descriptionTranslations?: TranslatedText;

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

    @Prop({ type: TranslatedTextSchema })
    nameTranslations?: TranslatedText;

    @Prop()
    description: string;

    @Prop({ type: TranslatedTextSchema })
    descriptionTranslations?: TranslatedText;

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
