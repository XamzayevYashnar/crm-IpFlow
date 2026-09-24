import { Module } from '@nestjs/common';
import { PrismaModule } from './core/config/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { MailModule } from './core/apps/mail/mail.module';
import { BaseModule } from './core/apps/service/base.module';
import { RedisModule } from './core/config/redis/redis.module';
import { MaterialModule } from './modules/material/material.module';
import { ProductModule } from './modules/product/product.module';
import { OperationModule } from './modules/operation/operation.module';
import { WorkerModule } from './modules/worker/worker.module';
import { TerminalModule } from './modules/terminal/terminal.module';
import { WorkAssignmentModule } from './modules/work-assignment/work-assignment.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CustomerModule } from './modules/customer/customer.module';
import { OrderModule } from './modules/order/order.module';
import { OrderBatchModule } from './modules/order-batch/order-batch.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminModule,
    MailModule,
    BaseModule,
    RedisModule,
    MaterialModule,
    ProductModule,
    OperationModule,
    WorkerModule,
    TerminalModule,
    WorkAssignmentModule,
    PaymentModule,
    CustomerModule,
    OrderModule,
    OrderBatchModule,
  ],
})
export class AppModule {}
