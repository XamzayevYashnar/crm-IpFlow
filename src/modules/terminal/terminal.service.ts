import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import Redis from 'ioredis';
import { PinLoginDto } from './dto/pin-login.dto';
import { PrismaService } from '../../core/config/database/prisma.service';
import { REDIS_CLIENT } from '../../core/config/redis/redis.module';
import { Crypt } from '../../infrastructure/lib/Crypt';
import { Token } from '../../infrastructure/lib/Token';
import { generatePayload } from '../../infrastructure/helper/payload-generator';
import { successRes } from '../../infrastructure/utils/success-response';

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 5 * 60;
const SESSION_SECONDS = 30 * 60;

@Injectable()
export class TerminalService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  private failKey(ip: string): string {
    return `pin-fail:${ip}`;
  }

  async login(dto: PinLoginDto, res: Response, ip: string) {
    const failKey = this.failKey(ip);
    const fails = Number(await this.redis.get(failKey)) || 0;

    if (fails >= MAX_ATTEMPTS) {
      throw new ForbiddenException("Juda ko'p noto'g'ri urinish. 5 daqiqadan keyin qayta urinib ko'ring");
    }

    // Telefon endi kiritilmaydi — PIN faol ishchilar orasida yagona bo'lgani uchun
    // to'g'ridan-to'g'ri shu PIN'ga mos foydalanuvchini qidiramiz.
    const candidates = await this.prisma.user.findMany({
      where: { pinCode: { not: null }, status: 'ACTIVE' },
      include: { role: true },
    });

    let matched: (typeof candidates)[number] | null = null;
    for (const candidate of candidates) {
      if (
        candidate.role.name === 'STAFF' &&
        candidate.pinCode &&
        (await Crypt.compare(dto.pinCode, candidate.pinCode).catch(() => false))
      ) {
        matched = candidate;
        break;
      }
    }

    if (!matched) {
      await this.redis.multi().incr(failKey).expire(failKey, LOCK_SECONDS).exec();
      throw new UnauthorizedException("PIN kod noto'g'ri");
    }

    await this.redis.del(failKey);

    const payload = generatePayload(matched.id, matched.role.name, matched.status);
    const { accessToken } = await Token.getToken(payload);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: SESSION_SECONDS * 1000,
    });

    return successRes({ user: { id: matched.id, fullName: matched.fullName } }, 200);
  }

  logout(res: Response) {
    Token.clearCookie(res);
    return successRes({ message: 'Chiqildi' }, 200);
  }
}
