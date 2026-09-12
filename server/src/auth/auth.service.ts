import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User, UserRole } from './schemas/user.schema';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
        private notificationService: NotificationService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userModel.findOne({ username });
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user._id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
        };
    }

    async register(registerDto: any) {
        const { username, email, password, name, phone, address, eventPreferences } = registerDto;

        // Check if user exists
        const existingUser = await this.userModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            throw new ConflictException('Username or Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Generate 6-digit PIN
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const pinExpires = new Date(Date.now() + 3600000); // 1 hr

        const user = new this.userModel({
            username,
            email,
            password: hashedPassword,
            name,
            phone,
            address,
            eventPreferences,
            role: UserRole.USER,
            verificationPin: pin,
            verificationPinExpires: pinExpires,
            isVerified: false,
        });

        await user.save();

        await this.notificationService.sendVerificationPin(email, pin);

        const { password: _, verificationPin: __, ...result } = user.toObject();
        return result;
    }

    async verifyEmail(email: string, pin: string) {
        const user = await this.userModel.findOne({
            email,
            verificationPin: pin,
            verificationPinExpires: { $gt: new Date() },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid or expired PIN');
        }

        user.isVerified = true;
        user.verificationPin = undefined;
        user.verificationPinExpires = undefined;
        await user.save();

        return { message: 'Email verified successfully' };
    }

    async forgotPassword(email: string) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            // Don't reveal if user exists
            return { message: 'If this email exists, a reset link has been sent.' };
        }

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();
        // In production, integrate NodeMailer or SendGrid here
        console.log(`Reset Token for ${email}: ${token}`);

        return { message: 'Reset email sent (check console for token)' };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return { message: 'Password reset successful' };
    }

    // Bootstrap method to create initial admin (guarded in the controller by ALLOW_ADMIN_SEED)
    async createInitialAdmin() {
        const adminExists = await this.userModel.findOne({ role: UserRole.ADMIN });
        if (!adminExists) {
            const plainPassword = randomBytes(12).toString('base64url');
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            const admin = new this.userModel({
                username: 'admin',
                email: 'admin@tamilfoodthaya.com',
                name: 'System Admin',
                phone: '+0000000000',
                password: hashedPassword,
                role: UserRole.ADMIN,
            });
            await admin.save();
            console.log(`[INIT ADMIN] Temporary admin credentials — username: admin, password: ${plainPassword}`);
        }
    }
}
