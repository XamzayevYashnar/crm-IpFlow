import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { Role } from '../../../generated/prisma/enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: 'Admin created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid admin payload.' })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({ status: 200, description: 'Admin list retrieved successfully.' })
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single admin user by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Admin id' })
  @ApiResponse({ status: 200, description: 'Admin retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin details' })
  @ApiParam({ name: 'id', type: Number, description: 'Admin id' })
  @ApiBody({ type: UpdateAdminDto })
  @ApiResponse({ status: 200, description: 'Admin updated successfully.' })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an admin user' })
  @ApiParam({ name: 'id', type: Number, description: 'Admin id' })
  @ApiResponse({ status: 200, description: 'Admin deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
