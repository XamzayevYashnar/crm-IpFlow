import { Body, Controller, Post } from '@nestjs/common';
import { MovementService } from '../services/movement.service';
import { CreateMovementDto } from '../dto/movement/create-movement';

@Controller('movement')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @Post()
  create(@Body() dto: CreateMovementDto){
    return this.movementService.create(dto);
  }
}
