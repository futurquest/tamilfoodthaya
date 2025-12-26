import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Settings extends Document {
    @Prop({ required: true, default: 'Tamil Food Thaya' })
    siteName: string;

    @Prop({ default: '' })
    address: string;

    @Prop({ default: '' })
    phone: string;

    @Prop({ default: '' })
    email: string;

    @Prop({ default: '' })
    whatsapp: string;

    @Prop({ type: Object, default: { monday: 'Gesloten', tuesday: '12:00 - 22:00', wednesday: '12:00 - 22:00', thursday: '12:00 - 22:00', friday: '12:00 - 23:00', saturday: '12:00 - 23:00', sunday: '12:00 - 22:00' } })
    businessHours: Record<string, string>;

    @Prop({ default: '' })
    facebookUrl: string;

    @Prop({ default: '' })
    instagramUrl: string;

    @Prop({ default: true })
    ordersEnabled: boolean;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
