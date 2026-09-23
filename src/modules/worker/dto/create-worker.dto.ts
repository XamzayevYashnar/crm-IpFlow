import { IsNotEmpty, IsString, IsOptional, IsNumber, Matches } from "class-validator";

export class CreateWorkerDto {
    @IsNotEmpty() @IsString() firstName!: string;
    @IsNotEmpty() @IsString() lastName!: string;
    @IsNotEmpty() @IsString() @Matches(/^\+?\d{9,15}$/, { message: "Telefon raqam formati noto'g'ri" }) phone!: string;

    @IsOptional() @IsNumber() hourlyPrice?: number;
}
