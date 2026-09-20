import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { PrismaService } from '../../../core/config/database/prisma.service';
import { successRes } from '../../../infrastructure/utils/success-response';
import { UpdateMaterialDto } from '../dto/update-material.dto';

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
    const materials = await this.prisma.material.findMany();

    if (materials.length === 0) throw new NotFoundException("Materials is empty");

    return materials;
  }

  async findOne(id: number){
    const isExists = await this.prisma.material.findUnique({
      where: { id }
    });

    if (!isExists) throw new NotFoundException('Material is not found');

    return successRes({isExists}, 200);
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

    await this.prisma.material.delete({
      where: { id }
    });

    return successRes({ message: "material is success deleted" }, 201)
  }
}
