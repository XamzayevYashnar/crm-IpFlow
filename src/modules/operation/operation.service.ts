import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/config/database/prisma.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { Prisma } from '@prisma-generated/client';

@Injectable()
export class OperationService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateOperationDto) {
    return this.prisma.operation.create({ data: dto });
  }

  findAll() {
    return this.prisma.operation.findMany({ orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const operation = await this.prisma.operation.findUnique({ where: { id } });
    if (!operation) throw new NotFoundException('Operatsiya topilmadi');
    return operation;
  }

  async update(id: number, dto: UpdateOperationDto) {
    await this.findOne(id); 
    return this.prisma.operation.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.operation.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          "Bu operatsiya mahsulot modeliga bog'langan, avval shu bog'lanishni o'chiring",
        );
      }
      throw error;
    }
  }
}