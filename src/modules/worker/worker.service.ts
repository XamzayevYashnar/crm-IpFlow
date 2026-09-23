import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { Crypt } from '../../infrastructure/lib/Crypt';
import { hashPinForLookup } from '../../infrastructure/helper/pin-lookup';
import { successRes } from '../../infrastructure/utils/success-response';
import { PrismaService } from '../../core/config/database/prisma.service';
import { UserStatus } from '../../../generated/prisma/enums';

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

@Injectable()
export class WorkerService {
  constructor(private readonly prisma: PrismaService) {}

  // PIN terminalga kirishda yagona identifikator (telefon so'ralmaydi),
  // shuning uchun barcha ishchilar orasida takrorlanmasligi kerak.
  // pinLookup (HMAC) orqali O(1) tekshiramiz — haqiqiy tasdiqlash esa
  // terminal kirishda bcrypt hash (pinCode) bilan amalga oshiriladi.
  private async generateUniquePin(): Promise<{ pin: string; pinLookup: string }> {
    for (let attempt = 0; attempt < 30; attempt++) {
      const candidate = generatePin();
      const pinLookup = hashPinForLookup(candidate);

      const collision = await this.prisma.user.findUnique({ where: { pinLookup } });
      if (!collision) {
        return { pin: candidate, pinLookup };
      }
    }

    throw new ConflictException("PIN kod generatsiya qilishda xatolik, qayta urinib ko'ring");
  }

  async create(dto: CreateWorkerDto) {
    const exists = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (exists) {
      throw new ConflictException("Bu telefon raqam allaqachon ro'yxatdan o'tgan");
    }

    const staffRole = await this.prisma.userRole.findUnique({ where: { name: 'STAFF' } });
    if (!staffRole) {
      throw new NotFoundException('STAFF roli topilmadi');
    }

    const { pin, pinLookup } = await this.generateUniquePin();
    const hashedPin = await Crypt.hash(pin);

    const worker = await this.prisma.user.create({
      data: {
        fullName: `${dto.firstName} ${dto.lastName}`,
        phone: dto.phone,
        pinCode: hashedPin,
        pinLookup,
        roleId: staffRole.id,
        status: UserStatus.ACTIVE,
        hourlyPrice: dto.hourlyPrice,
      },
    });

    // pin faqat shu javobda, ochiq holda, bir marta qaytariladi — bazada faqat hash saqlanadi
    return successRes(
      { worker: { id: worker.id, fullName: worker.fullName, phone: worker.phone }, pin },
      201,
    );
  }

  async findAll() {
    const staffRole = await this.prisma.userRole.findUnique({ where: { name: 'STAFF' } });

    const workers = await this.prisma.user.findMany({
      where: { roleId: staffRole?.id },
      select: {
        id: true,
        fullName: true,
        phone: true,
        status: true,
        hourlyPrice: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successRes({ workers }, 200);
  }

  private async findWorkerOrThrow(id: number) {
    const worker = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        phone: true,
        status: true,
        hourlyPrice: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!worker) {
      throw new NotFoundException(`Worker #${id} topilmadi`);
    }

    return worker;
  }

  async findOne(id: number) {
    const worker = await this.findWorkerOrThrow(id);
    return successRes({ worker }, 200);
  }

  async update(id: number, dto: UpdateWorkerDto) {
    await this.findWorkerOrThrow(id);

    if (dto.phone) {
      const phoneTaken = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
      if (phoneTaken && phoneTaken.id !== id) {
        throw new ConflictException("Bu telefon raqam allaqachon ro'yxatdan o'tgan");
      }
    }

    const fullName =
      dto.firstName || dto.lastName
        ? [dto.firstName, dto.lastName].filter(Boolean).join(' ')
        : undefined;

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        fullName,
        phone: dto.phone,
        hourlyPrice: dto.hourlyPrice,
        status: dto.status,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        status: true,
        hourlyPrice: true,
        updatedAt: true,
      },
    });

    return successRes({ worker: updated }, 200);
  }

  async remove(id: number) {
    await this.findWorkerOrThrow(id);

    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.BLOCKED },
    });

    return successRes({ message: 'Worker bloklandi' }, 200);
  }

  async resetPin(id: number) {
    await this.findWorkerOrThrow(id);

    const { pin, pinLookup } = await this.generateUniquePin();
    const hashedPin = await Crypt.hash(pin);

    await this.prisma.user.update({
      where: { id },
      data: { pinCode: hashedPin, pinLookup },
    });

    return successRes({ pin }, 200);
  }
}
