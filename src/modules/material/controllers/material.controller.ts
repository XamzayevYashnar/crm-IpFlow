import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MaterialService } from '../services/material.service';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { Role } from '../../../../generated/prisma/enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@ApiTags('Materials')
@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @ApiOperation({ summary: 'Create a material record' })
  @ApiBody({ type: CreateMaterialDto })
  @ApiResponse({ status: 201, description: 'Material created successfully.' })
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialService.create(createMaterialDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all materials' })
  @ApiResponse({ status: 200, description: 'Materials retrieved successfully.' })
  findAll(){
    return this.materialService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a material by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Material id' })
  @ApiResponse({ status: 200, description: 'Material retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Material not found.' })
  findOne(@Param('id', ParseIntPipe) id: number){
    return this.materialService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a material' })
  @ApiParam({ name: 'id', type: Number, description: 'Material id' })
  @ApiResponse({ status: 200, description: 'Material deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Material not found.' })
  delete(@Param('id', ParseIntPipe) id: number){
    return this.materialService.delete(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a material' })
  @ApiParam({ name: 'id', type: Number, description: 'Material id' })
  @ApiBody({ type: UpdateMaterialDto })
  @ApiResponse({ status: 200, description: 'Material updated successfully.' })
  @ApiResponse({ status: 404, description: 'Material not found.' })
  update(@Body() dto: UpdateMaterialDto, @Param('id', ParseIntPipe) id: number){
    return this.materialService.update(dto, id);
  }
}
