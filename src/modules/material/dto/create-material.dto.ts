import { IsDecimal, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";
import { MaterialUnit, MovementType } from "../../../../generated/prisma";
import { Type } from "class-transformer";

export class CreateMaterialDto {
    @IsNotEmpty({ message: "Name is required" })
    @IsString({ message: "Name is must be a string" })
    name!: string;

    @IsNotEmpty({ message: "Material unit is required" })
    @IsEnum(MaterialUnit, { message: "Material unit is incorrect. Allowed values: KG, METR" })
    unit!: MaterialUnit;

    @IsOptional()
    @IsEnum(MovementType, { message: "Type is incorrect. Allowed values: IN, OUT" })
    type!: MovementType;

    @ValidateIf(o => o.type !== undefined)
    @IsNotEmpty({ message: "Quantity is required when type is provided" })
    @IsDecimal({}, { message: "Quantity must be a valid decimal number (e.g. 10.50)" })
    @Type(() => String) 
    quantity!: string; 

    @IsOptional()
    @IsString({ message: "Reason must be a string" })
    reason?: string;
}
