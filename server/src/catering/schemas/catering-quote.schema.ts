import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CateringQuote extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    eventDate: Date;

    @Prop({ required: true, type: Number })
    guests: number;

    @Prop({ required: true })
    location: string;

    @Prop()
    budgetRange: string;

    @Prop()
    eventType: string;

    @Prop()
    notes: string;

    @Prop()
    utmSource: string;

    @Prop()
    campaign: string;
}

export const CateringQuoteSchema = SchemaFactory.createForClass(CateringQuote);
