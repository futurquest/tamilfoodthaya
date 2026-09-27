import { IsBoolean, IsEnum, IsString, ValidateIf } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class AdminUpdateUserDto {
    @ValidateIf((_, value) => value !== undefined)
    @IsString()
    name?: string;

    @ValidateIf((_, value) => value !== undefined)
    @IsString()
    phone?: string;

    @ValidateIf((_, value) => value !== undefined)
    @IsEnum(UserRole)
    role?: UserRole;

    @ValidateIf((_, value) => value !== undefined)
    @IsBoolean()
    isVerified?: boolean;
}
