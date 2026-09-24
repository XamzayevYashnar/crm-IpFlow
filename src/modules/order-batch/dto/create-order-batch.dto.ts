import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateOrderBatchInputDto {
  @ApiProperty({ example: 1, description: "Rang spravochnikdagi ID (Sozlamalar bo'limi)" })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  colorId: number;

  @ApiProperty({ example: 1, description: "O'lcham spravochnikdagi ID (Sozlamalar bo'limi)" })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  sizeId: number;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  totalQuantity: number;
}
