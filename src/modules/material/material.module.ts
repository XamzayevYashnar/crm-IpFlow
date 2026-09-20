import { Module } from '@nestjs/common';
import { MaterialController } from './controllers/material.controller';
import { MaterialService } from './services/material.service';
import { MovementService } from './services/movement.service';
import { MovementController } from './controllers/movement.controller';

@Module({
  controllers: [MaterialController, MovementController],
  providers: [MaterialService, MovementService],
})
export class MaterialModule {}