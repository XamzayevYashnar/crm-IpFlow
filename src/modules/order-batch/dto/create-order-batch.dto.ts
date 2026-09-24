import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateOrderBatchDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  orderId: number;

  @ApiProperty({ example: 'Qora' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  color: string;

  @ApiProperty({ example: 'M' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  size: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  totalQuantity: number;
}
