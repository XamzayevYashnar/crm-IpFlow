import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/config/database/prisma.service';
import { CreateMovementDto } from '../dto/movement/create-movement';
import { Prisma, MovementType } from '../../../../generated/prisma/client';
import { successRes } from 'src/infrastructure/utils/success-response';
import { UpdateMovement } from '../dto/movement/update-movement';

@Injectable()
export class MovementService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMovementDto) {
    const materialId = Number(dto.materialId);
    if (!materialId || Number.isNaN(materialId)) {
      throw new BadRequestException("materialId noto'g'ri yuborildi");
    }

    if (dto.quantity === undefined || dto.quantity === null) {
      throw new BadRequestException('Quantity is required');
    }

    const amount = new Prisma.Decimal(dto.quantity);
    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException("Miqdor 0 dan katta bo'lishi shart");
    }

    const type = String(dto.type).toUpperCase();
    if (type !== MovementType.IN && type !== MovementType.OUT) {
      throw new BadRequestException("type faqat IN yoki OUT bo'lishi mumkin");
    }

    const isOut = type === MovementType.OUT;

    const result = await this.prisma.$transaction(
      async (prisma) => {
        const material = await prisma.material.findUnique({
          where: { id: materialId },
        });

        if (!material) {
          throw new NotFoundException('Material topilmadi');
        }

        const currentBalance = new Prisma.Decimal(material.currentBalance ?? 0);
        if (isOut && currentBalance.lessThan(amount)) {
          throw new BadRequestException('Omborda yetarli mahsulot yoq!');
        }

        const movement = await prisma.inventoryMovement.create({
          data: {
            quantity: amount,
            type,
            reason: dto.reason ?? 'Empty',
            material: { connect: { id: materialId } },
          },
        });

        const updatedMaterial = await prisma.material.update({
          where: { id: materialId },
          data: {
            currentBalance: isOut ? { decrement: amount } : { increment: amount },
          },
        });

        return { material: updatedMaterial, movement };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return successRes(result, 201);
  } 

  async findAll() {
    const data = await this.prisma.inventoryMovement.findMany({ 
      include: { material: true } 
    });
    
    if (data.length === 0) {
      throw new NotFoundException("Data is empty");
    }
    return successRes(data, 200);
  }

  async findOne(id: number) {
    const movement = await this.prisma.inventoryMovement.findUnique({
      where: { id },
      include: { material: true }
    });

    if (!movement) {
      throw new NotFoundException("Movement is not found");
    }
    return successRes({ isExists: movement }, 200);
  }

  async update(dto: UpdateMovement, id: number) {
    const movement = await this.prisma.inventoryMovement.findUnique({ where: { id } });

    if (!movement) {
      throw new NotFoundException("Movement is not found");
    }

    if (dto.type || dto.quantity || dto.materialId) {
      throw new BadRequestException("You cannot update type, quantity, and materialId");
    }

    const updatedMovement = await this.prisma.inventoryMovement.update({
      where: { id },
      data: {
        reason: dto.reason,
      },
    });

    return successRes({ updatedMovement }, 200); 
  }

  async delete(id: number){
    await this.findOne(id);
    await this.prisma.inventoryMovement.delete({ where: { id } });
    return successRes({ message: `movement: ${id}, is success deleted` }, 201);
  }
}
