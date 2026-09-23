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
import { ProductService } from './product.service';
import { CreateProductModelDto } from './dto/create-product.dto';
import { UpdateProductModelDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { Role } from '../../../generated/prisma/enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  @ApiBody({ type: CreateProductModelDto })
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  create(@Body() dto: CreateProductModelDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Product id' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', type: Number, description: 'Product id' })
  @ApiBody({ type: UpdateProductModelDto })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductModelDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', type: Number, description: 'Product id' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}