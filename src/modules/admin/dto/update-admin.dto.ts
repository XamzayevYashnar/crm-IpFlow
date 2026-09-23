import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateAdminDto } from './create-admin.dto';
import { UserStatus } from '../../../../generated/prisma/enums';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status is incorrect. Allowed values: ACTIVE, INACTIVE, BLOCKED' })
  status?: UserStatus;
}
