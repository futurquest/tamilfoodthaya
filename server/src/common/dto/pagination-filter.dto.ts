import { IsOptional, IsInt, IsString, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationFilterDto {
    @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number = 1;
    @IsOptional() @IsInt() @Min(1) @Max(100) @Type(() => Number) limit?: number = 20;
    @IsOptional() @IsString() status?: string;
    @IsOptional() @IsDateString() from?: string;
    @IsOptional() @IsDateString() to?: string;
}
