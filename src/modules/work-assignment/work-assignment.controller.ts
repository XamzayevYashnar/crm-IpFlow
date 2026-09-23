import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { WorkAssignmentService } from './work-assignment.service';
import { TakeWorkDto } from './dto/take-work.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { Role } from '../../../generated/prisma/enums';
import type { IPayload } from '../../common/interface/interface-payload';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STAFF)
@Controller('work-assignments')
export class WorkAssignmentController {
  constructor(private readonly workAssignmentService: WorkAssignmentService) {}

  @Get('available')
  available() {
    return this.workAssignmentService.available();
  }

  @Post('take')
  take(@Body() dto: TakeWorkDto, @CurrentUser() user: IPayload) {
    return this.workAssignmentService.take(user.sub, dto);
  }

  @Get('my')
  my(@CurrentUser() user: IPayload) {
    return this.workAssignmentService.my(user.sub);
  }

  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: IPayload) {
    return this.workAssignmentService.complete(id, user.sub);
  }

  @Patch(':id/return')
  returnWork(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: IPayload) {
    return this.workAssignmentService.returnWork(id, user.sub);
  }
}
