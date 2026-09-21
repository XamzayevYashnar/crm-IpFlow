import { IsDecimal, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";
import { Type } from "class-transformer";
import { MaterialUnit } from "../../../../generated/prisma/client"

export class CreateMaterialDto {
    @IsNotEmpty({ message: "Name is required" })
    @IsString({ message: "Name is must be a string" })
    name!: string;

    @IsNotEmpty({ message: "Material unit is required" })
    @IsEnum(MaterialUnit, { message: "Material unit is incorrect. Allowed values: KG, METR" })
    unit!: MaterialUnit;

    @IsOptional()
    @ValidateIf(o => o.type !== undefined)
    @IsNotEmpty({ message: "Quantity is required when type is provided" })
    @IsDecimal({}, { message: "Quantity must be a valid decimal number (e.g. 10.50)" })
    @Type(() => String) 
    currentBalance?: string; 
}
