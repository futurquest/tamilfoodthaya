import { IsString, MinLength, IsEnum, IsOptional, IsEmail } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class RegisterDto {
    @IsString()
    @MinLength(4)
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
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
