import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Phone number is required' })
    phone: string;

    @IsString()
    @IsNotEmpty({ message: 'Message is required' })
    message: string;
}
