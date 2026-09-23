import { Module } from '@nestjs/common';
import { WorkAssignmentService } from './work-assignment.service';
import { WorkAssignmentController } from './work-assignment.controller';

@Module({
  controllers: [WorkAssignmentController],
  providers: [WorkAssignmentService],
})
export class WorkAssignmentModule {}
