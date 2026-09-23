import { IsNotEmpty, IsNumberString, Length } from "class-validator";

export class PinLoginDto {
    @IsNotEmpty() @IsNumberString({}, { message: "PIN kod faqat raqamlardan iborat bo'lishi kerak" })
    @Length(4, 4, { message: "PIN kod 4 xonali bo'lishi kerak" })
    pinCode!: string;
}
