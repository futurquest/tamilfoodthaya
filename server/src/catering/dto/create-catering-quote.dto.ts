import { Type } from 'class-transformer';
import {
    IsDateString,
    IsEmail,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateCateringQuoteDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsDateString()
    eventDate: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    guests: number;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    budgetRange?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    eventType?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    utmSource?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    campaign?: string;
}