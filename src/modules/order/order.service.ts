import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/config/database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AssignCustomerDto } from './dto/assign-customer.dto';
import { CreateOrderBatchInputDto } from '../order-batch/dto/create-order-batch.dto';
import { Prisma } from '../../../generated/prisma/client';

const ORDER_INCLUDE = {
  customer: true,
  productModel: true,
  orderBatches: { include: { color: true, size: true } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureBatchCatalogExists(batches: CreateOrderBatchInputDto[]) {
    const colorIds = [...new Set(batches.map((b) => b.colorId))];
    const sizeIds = [...new Set(batches.map((b) => b.sizeId))];

    const [colors, sizes] = await Promise.all([
      this.prisma.color.findMany({ where: { id: { in: colorIds } }, select: { id: true } }),
      this.prisma.size.findMany({ where: { id: { in: sizeIds } }, select: { id: true } }),
    ]);

    const foundColorIds = colors.map((c) => c.id);
    const foundSizeIds = sizes.map((s) => s.id);
    const missingColors = colorIds.filter((id) => !foundColorIds.includes(id));
    const missingSizes = sizeIds.filter((id) => !foundSizeIds.includes(id));

    if (missingColors.length) {
      throw new BadRequestException(`Rang spravochnikda topilmadi: ID ${missingColors.join(', ')}`);
    }
    if (missingSizes.length) {
      throw new BadRequestException(`O'lcham spravochnikda topilmadi: ID ${missingSizes.join(', ')}`);
    }
  }

  async create(dto: CreateOrderDto) {
    const model = await this.prisma.productModel.findUnique({ where: { id: dto.modelId } });
    if (!model) throw new NotFoundException('Mahsulot modeli topilmadi');

    await this.ensureBatchCatalogExists(dto.batches);

    return this.prisma.order.create({
      data: {
        modelId: dto.modelId,
        orderBatches: {
          create: dto.batches.map((b) => ({
            colorId: b.colorId,
            sizeId: b.sizeId,
            totalQuantity: b.totalQuantity,
          })),
        },
      },
      include: ORDER_INCLUDE,
    });
  }

  async addBatch(orderId: number, dto: CreateOrderBatchInputDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    await this.ensureBatchCatalogExists([dto]);

    return this.prisma.orderBatch.create({
      data: { orderId, colorId: dto.colorId, sizeId: dto.sizeId, totalQuantity: dto.totalQuantity },
      include: { color: true, size: true },
    });
  }

  async assignCustomer(orderId: number, dto: AssignCustomerDto) {
    await this.findOne(orderId);
    const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('Mijoz topilmadi');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { customerId: dto.customerId },
      include: ORDER_INCLUDE,
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      orderBy: { id: 'desc' },
      include: ORDER_INCLUDE,
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
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
