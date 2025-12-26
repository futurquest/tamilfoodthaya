import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('verify')
    async verify(@Body() body: { email: string; pin: string }) {
        return this.authService.verifyEmail(body.email, body.pin);
    }

    @Post('login')
    async login(@Body() body: LoginDto) {
        const user = await this.authService.validateUser(body.username, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto) {
        return this.authService.forgotPassword(body.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordDto) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }

    @Post('init-admin')
    async initAdmin() {
        await this.authService.createInitialAdmin();
        return { message: 'Admin initialized' };
    }
}
