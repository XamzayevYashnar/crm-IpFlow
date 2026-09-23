import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email format is incorrect' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  fullName?: string;

  @IsNotEmpty({ message: 'Role id is required' })
  @IsInt({ message: 'Role id must be an integer' })
  roleId!: number;
}
