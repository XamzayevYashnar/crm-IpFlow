import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/config/database/prisma.service';
import { successRes } from '../../infrastructure/utils/success-response';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AssignmentStatus, Prisma } from '../../../generated/prisma/client';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, createdBy: number) {
    const worker = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!worker) {
      throw new NotFoundException('Xodim topilmadi');
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId: dto.userId,
        amount: dto.amount,
        note: dto.note,
        createdBy,
      },
    });

    return successRes({ payment }, 201);
  }

  async listByUser(userId: number) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { paidAt: 'desc' },
    });

    return successRes({ payments }, 200);
  }

  async earnings(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    let totalHours = new Prisma.Decimal(0);
    let hourlyRate = new Prisma.Decimal(0);
    let hourlyEarnings = new Prisma.Decimal(0);
    let completedAssignments: Array<{ quantityAssigned: number; modelOperation: { pricePerUnit: Prisma.Decimal | null } }> = [];
    let pieceworkEarnings = new Prisma.Decimal(0);

    if (user.payType === 'HOURLY') {
      const hoursAgg = await this.prisma.attendance.aggregate({
        where: { userId },
        _sum: { totalHours: true },
      });
      totalHours = hoursAgg._sum.totalHours ?? new Prisma.Decimal(0);
      hourlyRate = user.hourlyPrice ?? new Prisma.Decimal(0);
      hourlyEarnings = totalHours.mul(hourlyRate);
    } else {
      completedAssignments = await this.prisma.workAssignment.findMany({
        where: { userId, status: AssignmentStatus.COMPLETED },
        include: { modelOperation: true },
      });

      pieceworkEarnings = completedAssignments.reduce((sum, wa) => {
        const price = wa.modelOperation.pricePerUnit ?? new Prisma.Decimal(0);
        return sum.add(price.mul(wa.quantityAssigned));
      }, new Prisma.Decimal(0));
    }

    const totalEarned = hourlyEarnings.add(pieceworkEarnings);

    const paidAgg = await this.prisma.payment.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    const totalPaid = paidAgg._sum.amount ?? new Prisma.Decimal(0);

    return successRes(
      {
        payType: user.payType,
        hourly: user.payType === 'HOURLY' ? { totalHours, hourlyRate, hourlyEarnings } : null,
        piecework:
          user.payType === 'PIECE_RATE'
            ? { completedCount: completedAssignments.length, pieceworkEarnings }
            : null,
        totalEarned,
        totalPaid,
        balance: totalEarned.sub(totalPaid),
      },
      200,
    );
  }
}
