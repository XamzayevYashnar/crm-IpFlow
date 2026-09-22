import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDecimal, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";
import { Type } from "class-transformer";
import { MaterialUnit } from "../../../../generated/prisma/client";

export class CreateMaterialDto {
  @ApiProperty({
    description: "Materialning nomi",
    example: "Polat list",
  })
  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name is must be a string" })
  name!: string;

  @ApiProperty({
    description: "Material o'lchov birligi",
    enum: MaterialUnit,
    example: "KG",
  })
  @IsNotEmpty({ message: "Material unit is required" })
  @IsEnum(MaterialUnit, { message: "Material unit is incorrect. Allowed values: KG, METR" })
  unit!: MaterialUnit;

  @ApiPropertyOptional({
    description: "Materialning joriy miqdori/balansi",
    type: String,
    example: "10.50",
  })
  @IsOptional()
  @ValidateIf(o => o.type !== undefined)
  @IsNotEmpty({ message: "Quantity is required when type is provided" })
  @IsDecimal({}, { message: "Quantity must be a valid decimal number (e.g. 10.50)" })
  @Type(() => String)
  currentBalance?: string;
}
