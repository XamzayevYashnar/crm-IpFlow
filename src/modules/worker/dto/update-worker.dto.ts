import { IsEnum, IsNumber, IsOptional, IsString, Matches } from "class-validator";
import { UserStatus, PayType } from "../../../../generated/prisma/enums";

export class UpdateWorkerDto {
    @IsOptional() @IsString() firstName?: string;
    @IsOptional() @IsString() lastName?: string;

    @IsOptional() @IsString() @Matches(/^\+?\d{9,15}$/, { message: "Telefon raqam formati noto'g'ri" })
    phone?: string;

    @IsOptional()
    @IsEnum(PayType, { message: "payType noto'g'ri. Ruxsat etilgan: HOURLY, PIECE_RATE" })
    payType?: PayType;

    @IsOptional() @IsNumber() hourlyPrice?: number;

    @IsOptional()
    @IsEnum(UserStatus, { message: "Status noto'g'ri. Ruxsat etilgan: ACTIVE, INACTIVE, BLOCKED" })
    status?: UserStatus;
}
