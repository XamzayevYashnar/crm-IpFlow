import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsEmail } from "class-validator"

export class VerifyOtpDto {
  @ApiProperty({ 
    example: "admin@gmail.com", 
    description: "Enter email address", 
    format: "email" 
  })
  @IsString({ message: "Email must be a string" })
  @IsNotEmpty({ message: "Email cannot be empty" })
  @IsEmail({}, { message: "Invalid email format" })
  email!: string

  @ApiProperty({ 
    example: "123456", 
    description: "Enter the OTP code received via email" 
  })
  @IsString({ message: "Code must be a string" })
  @IsNotEmpty({ message: "Code cannot be empty" })
  code!: string
}
