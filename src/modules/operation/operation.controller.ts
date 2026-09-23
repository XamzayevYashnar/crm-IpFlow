import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OperationService } from './operation.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { Role } from '../../../generated/prisma/enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@ApiTags('Operations')
@Controller('operations')
export class OperationController {
  constructor(private readonly service: OperationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new operation' })
  @ApiBody({ type: CreateOperationDto })
  @ApiResponse({ status: 201, description: 'Operation created successfully.' })
  create(@Body() dto: CreateOperationDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all operations' })
  @ApiResponse({ status: 200, description: 'Operations list retrieved successfully.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one operation by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Operation id' })
  @ApiResponse({ status: 200, description: 'Operation retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Operation not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an operation' })
  @ApiParam({ name: 'id', type: Number, description: 'Operation id' })
  @ApiBody({ type: UpdateOperationDto })
  @ApiResponse({ status: 200, description: 'Operation updated successfully.' })
  @ApiResponse({ status: 404, description: 'Operation not found.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOperationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an operation' })
  @ApiParam({ name: 'id', type: Number, description: 'Operation id' })
  @ApiResponse({ status: 200, description: 'Operation deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Operation not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}