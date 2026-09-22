import { MovementType } from "@prisma-generated/enums";
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateMovementDto {
  @ApiProperty({ example: 1, description: 'ID material' })
  @IsNotEmpty()
  @IsInt()
  materialId!: number;

  @ApiProperty({ enum: MovementType, description: 'Type IN or OUT' })
  @IsNotEmpty()
  @IsEnum(MovementType)
  type!: MovementType;

  @ApiProperty({ example: 150.50, description: 'Amount' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  quantity!: number;

  @ApiPropertyOptional({ example: 'Reason to upload party', description: 'reason' })
  @IsOptional()
  @IsString()
  @Length(5, 255)
  reason?: string;
}
