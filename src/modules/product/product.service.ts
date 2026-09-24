import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma-generated/client';
import { CreateProductModelDto } from './dto/create-product.dto';
import { UpdateProductModelDto } from './dto/update-product.dto';
import { PrismaService } from 'src/core/config/database/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductModelDto) {
    this.validateNoDuplicates(dto.operations, dto.materials);
    await this.ensureRelationsExist(dto.operations, dto.materials);

    try {
      return await this.prisma.productModel.create({
        data: {
          name: dto.name,
          sku: dto.sku,
          modelOperations: dto.operations?.length
            ? {
                create: dto.operations.map((op) => ({
                  stepOrder: op.stepOrder,
                  pricePerUnit: op.pricePerUnit,
                  operation: { connect: { id: op.operationId } },
                })),
              }
            : undefined,
          modelMaterials: dto.materials?.length
            ? {
                create: dto.materials.map((m) => ({
                  quantityNeeded: m.quantityNeeded,
                  material: { connect: { id: m.materialId } },
                })),
              }
            : undefined,
        },
        include: {
          modelOperations: { include: { operation: true } },
          modelMaterials: { include: { material: true } },
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll() {
    return this.prisma.productModel.findMany({
      orderBy: { id: 'asc' },
      include: {
        modelOperations: {
          include: { operation: true },
          orderBy: { stepOrder: 'asc' },
        },
        modelMaterials: { include: { material: true } },
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.productModel.findUnique({
      where: { id },
      include: {
        modelOperations: {
          include: { operation: true },
          orderBy: { stepOrder: 'asc' },
        },
        modelMaterials: { include: { material: true } },
      },
    });
    if (!product) throw new NotFoundException('Mahsulot modeli topilmadi');
    return product;
  }

  async update(id: number, dto: UpdateProductModelDto) {
    await this.findOne(id); // avval mavjudligini tekshirish
    this.validateNoDuplicates(dto.operations, dto.materials);
    await this.ensureRelationsExist(dto.operations, dto.materials);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // agar operations/materials yuborilgan bo'lsa - eskisini o'chirib, qaytadan yozamiz
        if (dto.operations) {
          await tx.modelOperation.deleteMany({ where: { modelId: id } });
        }
        if (dto.materials) {
          await tx.modelMaterial.deleteMany({ where: { productId: id } });
        }

        return tx.productModel.update({
          where: { id },
          data: {
            name: dto.name,
            sku: dto.sku,
            modelOperations: dto.operations?.length
              ? {
                  create: dto.operations.map((op) => ({
                    stepOrder: op.stepOrder,
                    pricePerUnit: op.pricePerUnit,
                    operation: { connect: { id: op.operationId } },
                  })),
                }
              : undefined,
            modelMaterials: dto.materials?.length
              ? {
                  create: dto.materials.map((m) => ({
                    quantityNeeded: m.quantityNeeded,
                    material: { connect: { id: m.materialId } },
                  })),
                }
              : undefined,
          },
          include: {
            modelOperations: { include: { operation: true } },
            modelMaterials: { include: { material: true } },
          },
        });
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.productModel.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'SKU, operatsiya tartibi yoki material takrorlanmoqda',
        );
      }
      if (error.code === 'P2003') {
        // masalan Order jadvali orqali bog'langan bo'lsa, o'chirib bo'lmaydi
        throw new ConflictException(
          "Bu mahsulot modeliga bog'liq boshqa yozuvlar bor, avval ularni o'chiring",
        );
      }
    }
    throw error;
  }

  private validateNoDuplicates(
    operations?: { operationId: number; stepOrder: number }[],
    materials?: { materialId: number; quantityNeeded: number }[],
  ) {
    if (operations?.length) {
      const opIds = operations.map((o) => o.operationId);
      const steps = operations.map((o) => o.stepOrder);
      if (new Set(opIds).size !== opIds.length) {
        throw new BadRequestException('operationId lar takrorlanmasligi kerak');
      }
      if (new Set(steps).size !== steps.length) {
        throw new BadRequestException('stepOrder lar takrorlanmasligi kerak');
      }
    }

    if (materials?.length) {
      const matIds = materials.map((m) => m.materialId);
      if (new Set(matIds).size !== matIds.length) {
        throw new BadRequestException('materialId lar takrorlanmasligi kerak');
      }
    }
  }

  private async ensureRelationsExist(
    operations?: { operationId: number; stepOrder: number }[],
    materials?: { materialId: number; quantityNeeded: number }[],
  ) {
    if (operations?.length) {
      const opIds = operations.map((o) => o.operationId);
      const found = await this.prisma.operation.findMany({
        where: { id: { in: opIds } },
        select: { id: true },
      });
      const foundIds = found.map((f) => f.id);
      const missing = opIds.filter((id) => !foundIds.includes(id));
      if (missing.length) {
        throw new BadRequestException(`Operatsiya topilmadi: ID ${missing.join(', ')}`);
      }
    }

    if (materials?.length) {
      const matIds = materials.map((m) => m.materialId);
      const found = await this.prisma.material.findMany({
        where: { id: { in: matIds } },
        select: { id: true },
      });
      const foundIds = found.map((f) => f.id);
      const missing = matIds.filter((id) => !foundIds.includes(id));
      if (missing.length) {
        throw new BadRequestException(`Material topilmadi: ID ${missing.join(', ')}`);
      }
    }
  }
}