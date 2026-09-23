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

    const hoursAgg = await this.prisma.attendance.aggregate({
      where: { userId },
      _sum: { totalHours: true },
    });
    const totalHours = hoursAgg._sum.totalHours ?? new Prisma.Decimal(0);
    const hourlyRate = user.hourlyPrice ?? new Prisma.Decimal(0);
    const hourlyEarnings = totalHours.mul(hourlyRate);

    const completedAssignments = await this.prisma.workAssignment.findMany({
      where: { userId, status: AssignmentStatus.COMPLETED },
      include: { modelOperation: true },
    });

    const pieceworkEarnings = completedAssignments.reduce((sum, wa) => {
      const price = wa.modelOperation.pricePerUnit ?? new Prisma.Decimal(0);
      return sum.add(price.mul(wa.quantityAssigned));
    }, new Prisma.Decimal(0));

    const totalEarned = hourlyEarnings.add(pieceworkEarnings);

    const paidAgg = await this.prisma.payment.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    const totalPaid = paidAgg._sum.amount ?? new Prisma.Decimal(0);

    return successRes(
      {
        hourly: { totalHours, hourlyRate, hourlyEarnings },
        piecework: { completedCount: completedAssignments.length, pieceworkEarnings },
        totalEarned,
        totalPaid,
        balance: totalEarned.sub(totalPaid),
      },
      200,
    );
  }
}
