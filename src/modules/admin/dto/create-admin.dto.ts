import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email address of the admin user.',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email format is incorrect' })
  email!: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'Password for the admin account. Minimum 6 characters.',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Display name of the admin user.',
  })
  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  fullName?: string;

  @ApiProperty({
    example: 1,
    description: 'Role id assigned to the admin user.',
    type: Number,
  })
  @IsNotEmpty({ message: 'Role id is required' })
  @IsInt({ message: 'Role id must be an integer' })
  roleId!: number;
}
