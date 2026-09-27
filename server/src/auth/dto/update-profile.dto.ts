import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional() @IsString() @MaxLength(120) name?: string;
    @IsOptional() @IsString() @MaxLength(40) phone?: string;
    @IsOptional() @IsString() @MaxLength(500) address?: string;
    @IsOptional() @IsArray() @IsString({ each: true }) eventPreferences?: string[];
}
