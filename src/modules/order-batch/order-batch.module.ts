import { Module } from '@nestjs/common';
import { OrderBatchService } from './order-batch.service';
import { OrderBatchController } from './order-batch.controller';

@Module({
  controllers: [OrderBatchController],
  providers: [OrderBatchService],
})
export class OrderBatchModule {}
