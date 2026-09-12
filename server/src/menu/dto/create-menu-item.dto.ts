import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const toBoolean = (value: unknown): boolean => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return Boolean(value);
};

export class CreateMenuItemDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Item name is required' })
    @MaxLength(120, { message: 'Item name is too long (max 120 characters)' })
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Description is too long (max 1000 characters)' })
    description?: string;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber({}, { message: 'Price must be a number' })
    @Min(0, { message: 'Price cannot be negative' })
    price: number;

    @ApiPropertyOptional()
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'Stock count cannot be negative' })
    stockCount?: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Category is required' })
    @IsMongoId({ message: 'Invalid category id' })
    categoryId?: string;

    @ApiPropertyOptional()
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'Spice level must be between 0 and 3' })
    @Max(3, { message: 'Spice level must be between 0 and 3' })
    spiceLevel?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean({ message: 'available must be a boolean' })
    available?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean({ message: 'isVeg must be a boolean' })
    isVeg?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean({ message: 'dailyAvailability must be a boolean' })
    dailyAvailability?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    image?: string;

    // Selectable meal choices (often delivered as a JSON string in multipart requests)
    @ApiPropertyOptional()
    @IsOptional()
    choices?: unknown;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateIf((o) => typeof o === 'object' || /^({|\[)/.test(String(o)))
    nameTranslations?: unknown;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateIf((o) => typeof o === 'object' || /^({|\[)/.test(String(o)))
    descriptionTranslations?: unknown;
}

const optional = true;

export class UpdateMenuItemDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Item name is required' })
    @MaxLength(120, { message: 'Item name is too long (max 120 characters)' })
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Description is too long (max 1000 characters)' })
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Price must be a number' })
    @Min(0, { message: 'Price cannot be negative' })
    price?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0, { message: 'Stock count cannot be negative' })
    stockCount?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsMongoId({ message: 'Invalid category id' })
    categoryId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0, { message: 'Spice level must be between 0 and 3' })
    @Max(3, { message: 'Spice level must be between 0 and 3' })
    spiceLevel?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean({ message: 'available must be a boolean' })
    available?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean({ message: 'isVeg must be a boolean' })
    isVeg?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean({ message: 'dailyAvailability must be a boolean' })
    dailyAvailability?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    image?: string;

    @ApiPropertyOptional()
    @IsOptional()
    choices?: unknown;

    @ApiPropertyOptional()
    @IsOptional()
    nameTranslations?: unknown;

    @ApiPropertyOptional()
    @IsOptional()
    descriptionTranslations?: unknown;
}