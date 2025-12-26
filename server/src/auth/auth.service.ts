import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
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
                role: user.role,
            },
        };
    }

    async register(registerDto: any) {
        const { username, email, password, role } = registerDto;

        // Check if user exists
        const existingUser = await this.userModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            throw new UnauthorizedException('Username or Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Generate 6-digit PIN
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const pinExpires = new Date(Date.now() + 3600000); // 1 hr

        const user = new this.userModel({
            username,
            email,
            password: hashedPassword,
            role: role || UserRole.USER,
            verificationPin: pin,
            verificationPinExpires: pinExpires,
            isVerified: false,
        });

        await user.save();

        // MOCK EMAIL SERVICE
        console.log(`[MOCK EMAIL] Verification PIN for ${email}: ${pin}`);

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

        console.log(`[MOCK EMAIL] Password reset token for ${user.email}: ${token}`);
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

    // Temporary method to create initial admin
    async createInitialAdmin() {
        const adminExists = await this.userModel.findOne({ role: UserRole.ADMIN });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new this.userModel({
                username: 'admin',
                email: 'admin@tamilfoodthaya.com',
                password: hashedPassword,
                role: UserRole.ADMIN,
            });
            await admin.save();
        }
    }
}
