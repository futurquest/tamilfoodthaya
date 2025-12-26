import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
    ADMIN = 'admin',
    STAFF = 'staff',
    USER = 'user',
}

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ type: String, enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Prop()
    resetPasswordToken?: string;

    @Prop()
    resetPasswordExpires?: Date;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop()
    verificationPin?: string;

    @Prop()
    verificationPinExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
