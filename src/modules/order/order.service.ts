import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/config/database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('Mijoz topilmadi');

    const model = await this.prisma.productModel.findUnique({ where: { id: dto.modelId } });
    if (!model) throw new NotFoundException('Mahsulot modeli topilmadi');

    return this.prisma.order.create({
      data: { customerId: dto.customerId, modelId: dto.modelId },
      include: { customer: true, productModel: true, orderBatches: true },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      orderBy: { id: 'desc' },
      include: { customer: true, productModel: true, orderBatches: true },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { customer: true, productModel: true, orderBatches: true },
    });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    return order;
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.order.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException("Bu buyurtmaga bog'liq partiyalar bor, avval ularni o'chiring");
      }
      throw error;
    }
  }
}
