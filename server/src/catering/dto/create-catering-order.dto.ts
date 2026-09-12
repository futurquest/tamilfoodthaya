import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEmail,
    IsInt,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

export class SelectedItemDto {
    @IsOptional()
    @IsString()
    itemId?: string;

    @IsOptional()
    @IsString()
    itemName?: string;

    @IsOptional()
    @IsString()
    choiceName?: string;
}

export class CateringAddonDto {
    @IsOptional()
    @IsString()
    addonId?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsString()
    pricingType?: string;
}

export class CategorySelectionDto {
    @IsString()
    @IsNotEmpty()
    categoryName: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SelectedItemDto)
    selectedItems: SelectedItemDto[];
}

export class CustomerInfoDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    notes?: string;
}

export class CreateCateringOrderDto {
    @IsNotEmpty()
    @IsMongoId()
    packageId: string;

    @IsInt()
    @Min(1)
    guests: number;

    @IsDateString()
    eventDate: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    eventLocation?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CategorySelectionDto)
    selections: CategorySelectionDto[];

    @ValidateNested()
    @Type(() => CustomerInfoDto)
    customerInfo: CustomerInfoDto;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    couponCode?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CateringAddonDto)
    addons?: CateringAddonDto[];

    // Always overwritten server-side from the authenticated session when present.
    @IsOptional()
    @IsString()
    userId?: string;
}