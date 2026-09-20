import {
    IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional,
    IsString, Max, MaxLength, Min, ArrayMaxSize, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
    HOMEPAGE_SECTION_KEYS,
    HOMEPAGE_MAX_FEATURED_MENU_ITEMS,
    HOMEPAGE_MAX_FEATURED_PACKAGES,
} from '../homepage.constants';
import type { HomepageSectionKey } from '../homepage.constants';

export class HomepageTextDto {
    @MaxLength(120)
    @IsOptional()
    en?: string;

    @MaxLength(120)
    @IsOptional()
    ta?: string;

    @MaxLength(120)
    @IsOptional()
    nl?: string;
}

export class HomepageSectionDto {
    @IsIn(HOMEPAGE_SECTION_KEYS as unknown as string[])
    key: HomepageSectionKey;

    @IsBoolean()
    visible: boolean;

    @IsInt()
    @Min(0)
    @Max(2)
    order: number;

    @ValidateNested()
    @Type(() => HomepageTextDto)
    title: HomepageTextDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => HomepageTextDto)
    subtitle?: HomepageTextDto;

    /** Non-empty translated text (any language) is required so a section never renders blank. */
    @IsOptional()
    @IsString()
    @MaxLength(400)
    description?: string;
}

export class HomepageDto {
    @IsArray()
    @ArrayMaxSize(3)
    @ValidateNested({ each: true })
    @Type(() => HomepageSectionDto)
    sections: HomepageSectionDto[];

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(HOMEPAGE_MAX_FEATURED_PACKAGES)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    featuredPackageIds?: string[];

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(HOMEPAGE_MAX_FEATURED_MENU_ITEMS)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    featuredMenuItemIds?: string[];
}
