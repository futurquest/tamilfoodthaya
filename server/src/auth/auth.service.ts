import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { UserEntity, UserRole } from './entities/user.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        private jwtService: JwtService,
        private notificationService: NotificationService,
        private configService: ConfigService,
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
        const pin = randomInt(100000, 1000000).toString();
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

        const token = randomBytes(32).toString('hex');
        user.resetPasswordToken = `sha256:${createHash('sha256').update(token).digest('hex')}`;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        await this.userRepo.save(user);
        await this.notificationService.sendPasswordResetToken(email, token);

        return { message: 'If this email exists, a reset link has been sent.' };
    }

    async resetPassword(token: string, newPassword: string) {
        const hashedToken = `sha256:${createHash('sha256').update(token).digest('hex')}`;
        const user = await this.userRepo.findOne({ where: [{ resetPasswordToken: hashedToken }, { resetPasswordToken: token }] });
        if (!user || !user.resetPasswordToken || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        const password = await bcrypt.hash(newPassword, 10);
        const updated = await this.userRepo.update(
            { _id: user._id, resetPasswordToken: user.resetPasswordToken, resetPasswordExpires: MoreThan(new Date()) },
            { password, resetPasswordToken: null, resetPasswordExpires: null },
        );
        if (updated.affected !== 1) throw new UnauthorizedException('Invalid or expired token');

        return { message: 'Password reset successful' };
    }

    async createInitialAdmin() {
        const adminExists = await this.userRepo.findOne({ where: { role: UserRole.ADMIN } });
        if (!adminExists) {
            const plainPassword = this.configService.get<string>('INITIAL_ADMIN_PASSWORD');
            if (!plainPassword || plainPassword.length < 8) {
                this.logger.warn('Initial admin was not created: configure INITIAL_ADMIN_PASSWORD with at least 8 characters.');
                return;
            }
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            const admin = this.userRepo.create({
                _id: UserEntity.newId(),
                username: 'admin',
                email: 'demo@example.com',
                name: 'System Admin',
                phone: 'demo',
                password: hashedPassword,
                role: UserRole.ADMIN,
            });
            await this.userRepo.save(admin);
            this.logger.log('Initial admin account created.');
        }
    }
}
