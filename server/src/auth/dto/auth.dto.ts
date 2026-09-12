import { IsString, MinLength, IsOptional, IsEmail } from 'class-validator';

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
    @MinLength(6)
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

export class ResetPasswordDto {
    @IsString()
    token: string;

    @IsString()
    @MinLength(6)
    newPassword: string;
}
