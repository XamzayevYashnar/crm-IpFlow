import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, Matches, ValidateIf } from "class-validator";
import { PayType } from "../../../../generated/prisma/enums";

export class CreateWorkerDto {
    @IsNotEmpty() @IsString() firstName!: string;
    @IsNotEmpty() @IsString() lastName!: string;
    @IsNotEmpty() @IsString() @Matches(/^\+?\d{9,15}$/, { message: "Telefon raqam formati noto'g'ri" }) phone!: string;

    @IsNotEmpty()
    @IsEnum(PayType, { message: "payType noto'g'ri. Ruxsat etilgan: HOURLY, PIECE_RATE" })
    payType!: PayType;

    @ValidateIf((o) => o.payType === PayType.HOURLY)
    @IsNotEmpty({ message: "Soatlik ishchi uchun hourlyPrice kiritilishi shart" })
    @IsNumber()
    hourlyPrice?: number;
}
