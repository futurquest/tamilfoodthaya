import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeadDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Naam is verplicht' })
    name: string;

    @ApiProperty()
    @IsEmail({}, { message: 'Ongeldig e-mailadres' })
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Telefoonnummer is verplicht' })
    phone: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    eventDate?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    guests?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    message?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    package?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    utmSource?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    campaign?: string;
}
