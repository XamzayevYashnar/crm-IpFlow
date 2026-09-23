import { IsEnum, IsNumber, IsOptional, IsString, Matches } from "class-validator";
import { UserStatus } from "../../../../generated/prisma/enums";

export class UpdateWorkerDto {
    @IsOptional() @IsString() firstName?: string;
    @IsOptional() @IsString() lastName?: string;

    @IsOptional() @IsString() @Matches(/^\+?\d{9,15}$/, { message: "Telefon raqam formati noto'g'ri" })
    phone?: string;

    @IsOptional() @IsNumber() hourlyPrice?: number;

    @IsOptional()
    @IsEnum(UserStatus, { message: "Status noto'g'ri. Ruxsat etilgan: ACTIVE, INACTIVE, BLOCKED" })
    status?: UserStatus;
}
