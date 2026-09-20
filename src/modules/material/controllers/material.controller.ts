import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MaterialService } from '../services/material.service';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';

@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialService.create(createMaterialDto);
  }

  @Get()
  findAll(){
    return this.materialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number){
    return this.materialService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number){
    return this.materialService.delete(id);
  }

  @Patch(':id')
  update(@Body() dto: UpdateMaterialDto, @Param('id', ParseIntPipe) id: number){
    return this.materialService.update(dto, id);
  }
}
