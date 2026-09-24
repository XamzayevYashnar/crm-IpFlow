import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/config/database/prisma.service';
import { UpdateBatchStatusDto } from './dto/update-status.dto';
import { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class OrderBatchService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.orderBatch.findMany({
      orderBy: { id: 'desc' },
      include: { order: { include: { customer: true, productModel: true } }, color: true, size: true },
    });
  }

  async findOne(id: number) {
    const batch = await this.prisma.orderBatch.findUnique({
      where: { id },
      include: { order: { include: { customer: true, productModel: true } }, color: true, size: true },
    });
    if (!batch) throw new NotFoundException('Partiya topilmadi');
    return batch;
  }

  async updateStatus(id: number, dto: UpdateBatchStatusDto) {
    await this.findOne(id);
    return this.prisma.orderBatch.update({ where: { id }, data: { status: dto.status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.orderBatch.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException("Bu partiyaga bog'liq ishlar bor, avval ularni o'chiring");
      }
      throw error;
    }
  }
}
