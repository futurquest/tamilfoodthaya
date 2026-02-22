import { IsOptional, IsInt, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationFilterDto {
    @IsOptional() @IsInt() @Type(() => Number) page?: number = 1;
    @IsOptional() @IsInt() @Type(() => Number) limit?: number = 20;
    @IsOptional() @IsString() status?: string;
    @IsOptional() @IsDateString() from?: string;
    @IsOptional() @IsDateString() to?: string;
}
