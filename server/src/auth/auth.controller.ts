import { Controller, Post, Body, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Throttle({ default: { limit: 15, ttl: 60000 } })
    @Post('verify')
    async verify(@Body() body: VerifyEmailDto) {
        return this.authService.verifyEmail(body.email, body.pin);
    }

    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @Post('login')
    async login(@Body() body: LoginDto) {
        const user = await this.authService.validateUser(body.username, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto) {
        return this.authService.forgotPassword(body.email);
    }

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordDto) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }

    @Post('init-admin')
    async initAdmin() {
        if (process.env.NODE_ENV === 'production' || this.configService.get<string>('ALLOW_ADMIN_SEED', 'false') !== 'true') {
            throw new ForbiddenException('Admin seeding is disabled');
        }
        await this.authService.createInitialAdmin();
        return { message: 'Admin initialized' };
    }
}
