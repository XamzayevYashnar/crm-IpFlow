import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/config/database/prisma.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class SizeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSizeDto) {
    try {
      return await this.prisma.size.create({ data: dto });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll() {
    return this.prisma.size.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const size = await this.prisma.size.findUnique({ where: { id } });
    if (!size) throw new NotFoundException("O'lcham topilmadi");
    return size;
  }

  async update(id: number, dto: UpdateSizeDto) {
    await this.findOne(id);
    try {
      return await this.prisma.size.update({ where: { id }, data: dto });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.size.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException("Bu nomdagi o'lcham allaqachon mavjud");
      }
      if (error.code === 'P2003') {
        throw new ConflictException("Bu o'lchamga bog'liq partiyalar bor, avval ularni o'chiring");
      }
    }
    throw error;
  }
}
