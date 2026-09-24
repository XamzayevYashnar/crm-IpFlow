import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/config/database/prisma.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class ColorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateColorDto) {
    try {
      return await this.prisma.color.create({ data: dto });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll() {
    return this.prisma.color.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const color = await this.prisma.color.findUnique({ where: { id } });
    if (!color) throw new NotFoundException('Rang topilmadi');
    return color;
  }

  async update(id: number, dto: UpdateColorDto) {
    await this.findOne(id);
    try {
      return await this.prisma.color.update({ where: { id }, data: dto });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.color.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Bu nomdagi rang allaqachon mavjud');
      }
      if (error.code === 'P2003') {
        throw new ConflictException("Bu rangga bog'liq partiyalar bor, avval ularni o'chiring");
      }
    }
    throw error;
  }
}
