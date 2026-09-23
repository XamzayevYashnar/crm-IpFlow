import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MovementService } from '../services/movement.service';
import { CreateMovementDto } from '../dto/movement/create-movement';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { UpdateMovement } from '../dto/movement/update-movement';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { Role } from '../../../../generated/prisma/enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@ApiTags('Material Movements')
@Controller('movement')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new material movement' })
  @ApiBody({ type: CreateMovementDto })
  @ApiResponse({ status: 201, description: 'Material movement created successfully.' })
  create(@Body() dto: CreateMovementDto){
    return this.movementService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all material movements' })
  @ApiResponse({ status: 200, description: 'Material movements retrieved successfully.' })
  findAll(){
    return this.movementService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a material movement by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Movement id' })
  @ApiResponse({ status: 200, description: 'Movement retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Movement not found.' })
  findOne(@Param('id', ParseIntPipe) id: number){
    return this.movementService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a material movement' })
  @ApiParam({ name: 'id', type: Number, description: 'Movement id' })
  @ApiBody({ type: UpdateMovement })
  @ApiResponse({ status: 200, description: 'Movement updated successfully.' })
  @ApiResponse({ status: 404, description: 'Movement not found.' })
  update(@Body() dto: UpdateMovement, @Param('id', ParseIntPipe) id: number){
    return this.movementService.update(dto, id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a material movement' })
  @ApiParam({ name: 'id', type: Number, description: 'Movement id' })
  @ApiResponse({ status: 200, description: 'Movement deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Movement not found.' })
  delete(@Param('id') id: number){
    return this.movementService.delete(id);
  }
}
