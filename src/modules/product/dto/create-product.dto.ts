import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsNumber,
  MaxLength,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateModelOperationInputDto {
  @ApiProperty({
    example: 3,
    description: 'ID of the operation used in the product workflow.',
    type: Number,
  })
  @IsInt()
  @IsPositive()
  operationId: number;

  @ApiProperty({
    example: 1,
    description: 'Order of this operation in the production sequence.',
    type: Number,
  })
  @IsInt()
  @IsPositive()
  stepOrder: number;

  @ApiProperty({
    example: 2500,
    description: 'Shu operatsiyaning bir dona uchun narxi (sdelno ishchilar uchun).',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  pricePerUnit: number;
}

export class CreateModelMaterialInputDto {
  @ApiProperty({
    example: 12,
    description: 'ID of the material required for the product.',
    type: Number,
  })
  @IsInt()
  @IsPositive()
  materialId: number;

  @ApiProperty({
    example: 5,
    description: 'Required quantity of the material for this product.',
    type: Number,
  })
  @IsPositive()
  quantityNeeded: number;
}

export class CreateProductModelDto {
  @ApiProperty({
    example: 'Steel Chair',
    description: 'Name of the product.',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'SC-001',
    description: 'Unique stock keeping unit (SKU) for the product.',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @ApiPropertyOptional({
    type: [CreateModelOperationInputDto],
    description: 'List of operations that define the product manufacturing flow.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateModelOperationInputDto)
  operations?: CreateModelOperationInputDto[];

  @ApiPropertyOptional({
    type: [CreateModelMaterialInputDto],
    description: 'List of materials needed to produce the product.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateModelMaterialInputDto)
  materials?: CreateModelMaterialInputDto[];
}