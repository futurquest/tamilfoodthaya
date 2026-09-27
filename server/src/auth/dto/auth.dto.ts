import { IsString, MinLength, IsOptional, IsEmail, Matches } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(4)
    username: string;

    @IsString()
    name: string;

    @IsString()
    phone: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsOptional()
    eventPreferences?: string[];
}

export class LoginDto {
    @IsString()
    username: string;

    @IsString()
    password: string;
}

export class ForgotPasswordDto {
    @IsEmail()
    email: string;
}

export class VerifyEmailDto {
    @IsEmail()
    email: string;

    @IsString()
    @Matches(/^\d{6}$/)
    pin: string;
}

export class ResetPasswordDto {
    @IsString()
    token: string;

    @IsString()
    @MinLength(8)
    newPassword: string;
}
