import { IsInt, IsNotEmpty, Min } from "class-validator";

export class TakeWorkDto {
    @IsNotEmpty() @IsInt() orderBatchId!: number;
    @IsNotEmpty() @IsInt() modelOperationId!: number;
    @IsNotEmpty() @IsInt() @Min(1) quantity!: number;
}
