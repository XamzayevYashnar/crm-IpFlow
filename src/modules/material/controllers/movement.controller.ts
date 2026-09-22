import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MovementService } from '../services/movement.service';
import { CreateMovementDto } from '../dto/movement/create-movement';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { UpdateMovement } from '../dto/movement/update-movement';

@Controller('movement')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @Post()
  create(@Body() dto: CreateMovementDto){
    return this.movementService.create(dto);
  }

  @Get()
  findAll(){
    return this.movementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number){
    return this.movementService.findOne(id);
  }

  @Patch(':id')
  update(@Body() dto: UpdateMovement, @Param('id', ParseIntPipe) id: number){
    return this.movementService.update(dto, id)
  }

  @Delete(':id')
  delete(@Param('id') id: number){
    return this.movementService.delete(id);
  }
}
