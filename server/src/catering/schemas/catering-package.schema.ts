import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CateringPackage extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, type: Number })
    pricePerPerson: number;

    @Prop({ required: true, type: Number })
    minGuests: number;

    @Prop()
    description: string;

    @Prop({ type: [String] })
    inclusions: string[];

    @Prop({ default: true })
    available: boolean;
}

export const CateringPackageSchema = SchemaFactory.createForClass(CateringPackage);
