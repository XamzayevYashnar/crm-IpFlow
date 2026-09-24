import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateSizeDto {
  @ApiProperty({ example: 'M', description: "O'lcham nomi.", maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name: string;
}
