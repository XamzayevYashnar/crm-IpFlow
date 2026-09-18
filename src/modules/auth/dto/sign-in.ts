import { IsNotEmpty, IsString, IsEmail, Length, min } from "class-validator"

export class SignInDto {
    @IsNotEmpty({ message: "Email is required" })
    @IsString({ message: "Email is must be a string" })
    @Length(6, 154, { message: "Email must be between 6 and 154 characters long" })
    @IsEmail() 
    email!: string

    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be a string' })
    @Length(8, 64, { message: 'Password must be between 8 and 64 characters long' })
    password!: string;
}