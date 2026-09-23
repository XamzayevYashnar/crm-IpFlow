import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { PrismaService } from '../../../core/config/database/prisma.service';
import { successRes } from '../../../infrastructure/utils/success-response';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { Prisma } from '../../../../generated/prisma/client';

@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaterialDto) {
    const newMaterial = await this.prisma.material.create({
      data: {
        name: dto.name,
        unit: dto.unit,
        currentBalance: dto.currentBalance ? dto.currentBalance : 0.00,
      }
    });

    return successRes({ newMaterial }, 201);
  }

  async findAll(){
    const materials = await this.prisma.material.findMany({
      include: {
        inventoryMovements: true,
      }
    });

    return successRes(materials, 200);
  }

  async findOne(id: number){
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        inventoryMovements: true,
      }
    });

    if (!material) throw new NotFoundException('Material is not found');

    return successRes({ material }, 200);
  }

  async update(dto: UpdateMaterialDto, id: number){
    await this.findOne(id);

    const updatedMaterial = await this.prisma.material.update({
      where: { id },
      data: dto,
    });

    return successRes({updatedMaterial}, 201);
  }

  async delete(id: number){
    await this.findOne(id);

    try {
      await this.prisma.material.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException(
          "Bu materialni o'chirib bo'lmaydi — unga bog'liq kirim/chiqim tarixi mavjud",
        );
      }
      throw error;
    }

    return successRes({ message: "material is success deleted" }, 201)
  }
}
