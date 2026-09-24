import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/config/database/prisma.service';
import { successRes } from '../../infrastructure/utils/success-response';
import { TakeWorkDto } from './dto/take-work.dto';
import { AssignmentStatus, BatchStatus } from '../../../generated/prisma/enums';
import { Prisma } from '../../../generated/prisma/client';

const MAX_ACTIVE_ASSIGNMENTS = 2;

@Injectable()
export class WorkAssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async available() {
    const batches = await this.prisma.orderBatch.findMany({
      where: { status: { in: [BatchStatus.NEW, BatchStatus.IN_PRODUCTION] } },
      include: {
        order: {
          include: {
            productModel: {
              include: { modelOperations: { include: { operation: true }, orderBy: { stepOrder: 'asc' } } },
            },
          },
        },
        color: true,
        size: true,
        workAssignments: true,
      },
    });

    const result: Array<{
      orderBatchId: number;
      batchNumber: number;
      modelOperationId: number;
      operationName: string;
      modelName: string;
      color: string;
      size: string;
      available: number;
    }> = [];

    for (const batch of batches) {
      const ops = batch.order.productModel.modelOperations;

      for (const op of ops) {
        const taken = batch.workAssignments
          .filter((wa) => wa.modelOperationId === op.id && wa.status !== AssignmentStatus.RETURNED)
          .reduce((sum, wa) => sum + wa.quantityAssigned, 0);

        let unlocked = batch.totalQuantity;
        if (op.stepOrder > 1) {
          const prevOp = ops.find((o) => o.stepOrder === op.stepOrder - 1);
          unlocked = prevOp
            ? batch.workAssignments
                .filter((wa) => wa.modelOperationId === prevOp.id && wa.status === AssignmentStatus.COMPLETED)
                .reduce((sum, wa) => sum + wa.quantityAssigned, 0)
            : 0;
        }

        const availableQty = unlocked - taken;
        if (availableQty > 0) {
          result.push({
            orderBatchId: batch.id,
            batchNumber: batch.batchNumber,
            modelOperationId: op.id,
            operationName: op.operation.name,
            modelName: batch.order.productModel.name,
            color: batch.color.name,
            size: batch.size.name,
            available: availableQty,
          });
        }
      }
    }

    return successRes({ items: result }, 200);
  }

  async take(userId: number, dto: TakeWorkDto) {
    try {
      const assignment = await this.prisma.$transaction(
        async (tx) => {
          const activeCount = await tx.workAssignment.count({
            where: { userId, status: AssignmentStatus.IN_PROGRESS },
          });

          if (activeCount >= MAX_ACTIVE_ASSIGNMENTS) {
            throw new BadRequestException(
              `Siz bir vaqtda maksimum ${MAX_ACTIVE_ASSIGNMENTS} ta ish olishingiz mumkin`,
            );
          }

          const modelOperation = await tx.modelOperation.findUnique({
            where: { id: dto.modelOperationId },
          });
          if (!modelOperation) {
            throw new NotFoundException('Operatsiya topilmadi');
          }

          const batch = await tx.orderBatch.findUnique({ where: { id: dto.orderBatchId } });
          if (!batch) {
            throw new NotFoundException('Partiya topilmadi');
          }

          const existing = await tx.workAssignment.findMany({
            where: {
              orderBatchId: dto.orderBatchId,
              modelOperationId: dto.modelOperationId,
              status: { not: AssignmentStatus.RETURNED },
            },
          });
          const taken = existing.reduce((sum, wa) => sum + wa.quantityAssigned, 0);

          let unlocked = batch.totalQuantity;
          if (modelOperation.stepOrder > 1) {
            const prevOp = await tx.modelOperation.findFirst({
              where: { modelId: modelOperation.modelId, stepOrder: modelOperation.stepOrder - 1 },
            });
            if (prevOp) {
              const prevCompleted = await tx.workAssignment.aggregate({
                where: { orderBatchId: dto.orderBatchId, modelOperationId: prevOp.id, status: AssignmentStatus.COMPLETED },
                _sum: { quantityAssigned: true },
              });
              unlocked = prevCompleted._sum.quantityAssigned ?? 0;
            } else {
              unlocked = 0;
            }
          }

          const availableQty = unlocked - taken;
          if (dto.quantity > availableQty) {
            throw new BadRequestException(`Faqat ${availableQty} dona mavjud`);
          }

          const created = await tx.workAssignment.create({
            data: {
              userId,
              orderBatchId: dto.orderBatchId,
              modelOperationId: dto.modelOperationId,
              quantityAssigned: dto.quantity,
              status: AssignmentStatus.IN_PROGRESS,
            },
          });

          if (batch.status === BatchStatus.NEW) {
            await tx.orderBatch.update({
              where: { id: batch.id },
              data: { status: BatchStatus.IN_PRODUCTION },
            });
          }

          return created;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      return successRes({ assignment }, 201);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        throw new ConflictException("Boshqa so'rov bilan to'qnashdi, qayta urinib ko'ring");
      }
      throw error;
    }
  }

  private async findOwnAssignment(id: number, userId: number) {
    const assignment = await this.prisma.workAssignment.findUnique({ where: { id } });
    if (!assignment) {
      throw new NotFoundException('Ish topilmadi');
    }
    if (assignment.userId !== userId) {
      throw new ForbiddenException("Bu sizning ishingiz emas");
    }
    return assignment;
  }

  async complete(id: number, userId: number) {
    const assignment = await this.findOwnAssignment(id, userId);
    if (assignment.status !== AssignmentStatus.IN_PROGRESS) {
      throw new BadRequestException('Faqat jarayondagi ishni tugatish mumkin');
    }

    const updated = await this.prisma.workAssignment.update({
      where: { id },
      data: { status: AssignmentStatus.COMPLETED, completedAt: new Date() },
    });

    return successRes({ assignment: updated }, 200);
  }

  async returnWork(id: number, userId: number) {
    const assignment = await this.findOwnAssignment(id, userId);
    if (assignment.status !== AssignmentStatus.IN_PROGRESS) {
      throw new BadRequestException('Faqat jarayondagi ishni qaytarish mumkin');
    }

    const updated = await this.prisma.workAssignment.update({
      where: { id },
      data: { status: AssignmentStatus.RETURNED },
    });

    return successRes({ assignment: updated }, 200);
  }

  async my(userId: number) {
    const assignments = await this.prisma.workAssignment.findMany({
      where: { userId },
      include: {
        orderBatch: { include: { color: true, size: true } },
        modelOperation: { include: { operation: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const shaped = assignments.map((wa) => ({
      ...wa,
      orderBatch: {
        ...wa.orderBatch,
        color: wa.orderBatch.color.name,
        size: wa.orderBatch.size.name,
      },
    }));

    return successRes({ assignments: shaped }, 200);
  }
}
