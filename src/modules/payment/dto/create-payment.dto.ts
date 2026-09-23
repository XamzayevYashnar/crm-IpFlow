import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";

export class CreatePaymentDto {
    @IsNotEmpty() @IsInt() userId!: number;

    @IsNotEmpty() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) amount!: number;

    @IsOptional() @IsString() @Length(0, 255) note?: string;
}
