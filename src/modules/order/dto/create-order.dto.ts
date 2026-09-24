import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsPositive, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderBatchInputDto } from '../../order-batch/dto/create-order-batch.dto';

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  modelId: number;

  @ApiPropertyOptional({
    type: [CreateOrderBatchInputDto],
    description: "Buyurtma ichidagi rang/o'lcham/miqdor partiyalari — kamida bittasi bo'lishi kerak.",
  })
  @IsArray()
  @ArrayMinSize(1, { message: "Kamida bitta partiya (rang/o'lcham/miqdor) kiritilishi kerak" })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderBatchInputDto)
  batches: CreateOrderBatchInputDto[];
}
