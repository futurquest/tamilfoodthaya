import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Lead extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    eventDate: string;

    @Prop({ required: true })
    guests: number;

    @Prop({ required: true })
    location: string;

    @Prop()
    message: string;

    @Prop()
    package: string;

    @Prop()
    utmSource: string;

    @Prop()
    campaign: string;

    @Prop({ default: 'OPEN' })
    status: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
