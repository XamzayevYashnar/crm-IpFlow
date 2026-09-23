import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, Length } from 'class-validator';

export class SignInDto {
    @ApiProperty({
        example: 'admin@example.com',
        description: 'User email address used for sign-in.',
        format: 'email',
        minLength: 6,
        maxLength: 154,
    })
    @IsNotEmpty({ message: 'Email is required' })
    @IsString({ message: 'Email is must be a string' })
    @Length(6, 154, { message: 'Email must be between 6 and 154 characters long' })
    @IsEmail()
    email!: string;

    @ApiProperty({
        example: 'P@ssw0rd123',
        description: 'User password for authentication.',
        minLength: 8,
        maxLength: 64,
    })
    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be a string' })
    @Length(8, 64, { message: 'Password must be between 8 and 64 characters long' })
    password!: string;
}