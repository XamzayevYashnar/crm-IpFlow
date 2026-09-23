import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { Role } from '../../../generated/prisma/enums';
import type { IPayload } from '../../common/interface/interface-payload';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post()
  create(@Body() dto: CreatePaymentDto, @CurrentUser() admin: IPayload) {
    return this.paymentService.create(dto, admin.sub);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('worker/:id')
  listByWorker(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.listByUser(id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('worker/:id/earnings')
  earningsByWorker(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.earnings(id);
  }

  @Roles(Role.STAFF)
  @Get('me')
  myPayments(@CurrentUser() user: IPayload) {
    return this.paymentService.listByUser(user.sub);
  }

  @Roles(Role.STAFF)
  @Get('me/earnings')
  myEarnings(@CurrentUser() user: IPayload) {
    return this.paymentService.earnings(user.sub);
  }
}
