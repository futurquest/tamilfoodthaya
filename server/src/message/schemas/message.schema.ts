import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    message: string;

    @Prop({ default: false })
    read: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
