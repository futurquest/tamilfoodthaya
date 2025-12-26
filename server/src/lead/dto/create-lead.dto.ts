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

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Datum is verplicht' })
    eventDate: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Aantal gasten is verplicht' })
    guests: string; // FormData often sends numbers as strings, logic layer might need to parse or we use @Type(() => Number) if JSON

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Locatie is verplicht' })
    location: string;

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
