import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UserEntity, UserRole } from './entities/user.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        private jwtService: JwtService,
        private notificationService: NotificationService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userRepo.findOne({ where: { username } });
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, verificationPin, verificationPinExpires, resetPasswordToken, resetPasswordExpires, ...rest } = user;
            return rest;
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

        const existing = await this.userRepo.findOne({
            where: [{ username }, { email }],
        });
        if (existing) {
            throw new ConflictException('Username or Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const pinExpires = new Date(Date.now() + 3600000);

        const user = this.userRepo.create({
            _id: UserEntity.newId(),
            username,
            email,
            password: hashedPassword,
            name,
            phone,
            address: address ?? null,
            eventPreferences: eventPreferences ?? null,
            role: UserRole.USER,
            isVerified: false,
            verificationPin: pin,
            verificationPinExpires: pinExpires,
        });

        const saved = await this.userRepo.save(user);

        await this.notificationService.sendVerificationPin(email, pin);

        const { password: _p, verificationPin: _vp, verificationPinExpires: _vpe, resetPasswordToken: _rpt, resetPasswordExpires: _rpe, ...result } = saved;
        return result;
    }

    async verifyEmail(email: string, pin: string) {
        const user = await this.userRepo.findOne({ where: { email, verificationPin: pin } });
        if (!user || !user.verificationPinExpires || user.verificationPinExpires < new Date()) {
            throw new UnauthorizedException('Invalid or expired PIN');
        }

        user.isVerified = true;
        user.verificationPin = null;
        user.verificationPinExpires = null;
        await this.userRepo.save(user);

        return { message: 'Email verified successfully' };
    }

    async forgotPassword(email: string) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            return { message: 'If this email exists, a reset link has been sent.' };
        }

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        await this.userRepo.save(user);
        console.log(`Reset Token for ${email}: ${token}`);

        return { message: 'Reset email sent (check console for token)' };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.userRepo.findOne({ where: { resetPasswordToken: token } });
        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await this.userRepo.save(user);

        return { message: 'Password reset successful' };
    }

    async createInitialAdmin() {
        const adminExists = await this.userRepo.findOne({ where: { role: UserRole.ADMIN } });
        if (!adminExists) {
            const plainPassword = randomBytes(12).toString('base64url');
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            const admin = this.userRepo.create({
                _id: UserEntity.newId(),
                username: 'admin',
                email: 'admin@tamilfoodthaya.com',
                name: 'System Admin',
                phone: '+0000000000',
                password: hashedPassword,
                role: UserRole.ADMIN,
            });
            await this.userRepo.save(admin);
            console.log(`[INIT ADMIN] Temporary admin credentials - username: admin, password: ${plainPassword}`);
        }
    }
}
