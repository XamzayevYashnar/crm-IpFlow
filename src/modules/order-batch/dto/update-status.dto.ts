import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BatchStatus } from '../../../../generated/prisma/enums';

export class UpdateBatchStatusDto {
  @ApiProperty({ enum: BatchStatus, example: BatchStatus.ACCEPTED })
  @IsNotEmpty()
  @IsEnum(BatchStatus)
  status: BatchStatus;
}
