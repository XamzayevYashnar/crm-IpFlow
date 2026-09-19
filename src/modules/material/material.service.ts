import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { PrismaService } from '../../core/config/database/prisma.service';
import { successRes } from '../../infrastructure/utils/success-response';

@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaterialDto) {
    if (dto.type && dto.type === 'OUT') {
      throw new BadRequestException('Cannot create a new material with an OUT movement type');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      
      const material = await tx.material.create({
        data: {
          name: dto.name,
          unit: dto.unit,
          currentBalance: dto.quantity ? dto.quantity : 0.00, 
        },
      });

      let firstMovement = null;
      
      if (dto.type && dto.quantity) {
        firstMovement = await tx.inventoryMovement.create({
          data: {
            materialId: material.id,
            quantity: dto.quantity,
            type: dto.type,
            reason: dto.reason || "Initial stock intake upon material creation",
          },
        });
      }

      return { material, movement: firstMovement };
    });

    return successRes(result, 201);
  }
}
