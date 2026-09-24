import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import Redis from 'ioredis';
import { PinLoginDto } from './dto/pin-login.dto';
import { PrismaService } from '../../core/config/database/prisma.service';
import { REDIS_CLIENT } from '../../core/config/redis/redis.module';
import { Crypt } from '../../infrastructure/lib/Crypt';
import { Token } from '../../infrastructure/lib/Token';
import { hashPinForLookup } from '../../infrastructure/helper/pin-lookup';
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

    // Telefon endi kiritilmaydi — PIN yaratilganda yagona bo'lishi ta'minlangan,
    // shuning uchun pinLookup (HMAC) orqali to'g'ridan-to'g'ri qidiramiz (O(1)),
    // so'ng bcrypt bilan yakuniy tasdiqlaymiz.
    const pinLookup = hashPinForLookup(dto.pinCode);
    const candidate = await this.prisma.user.findUnique({
      where: { pinLookup },
      include: { role: true },
    });

    const valid =
      !!candidate &&
      candidate.role.name === 'STAFF' &&
      candidate.status === 'ACTIVE' &&
      !!candidate.pinCode &&
      (await Crypt.compare(dto.pinCode, candidate.pinCode));

    if (!valid || !candidate) {
      await this.redis.multi().incr(failKey).expire(failKey, LOCK_SECONDS).exec();
      throw new UnauthorizedException("PIN kod noto'g'ri");
    }

    await this.redis.del(failKey);

    const payload = generatePayload(candidate.id, candidate.role.name, candidate.status);
    const { accessToken } = await Token.getToken(payload);

    Token.setTerminalCookie(res, accessToken, SESSION_SECONDS * 1000);

    return successRes({ user: { id: candidate.id, fullName: candidate.fullName } }, 200);
  }

  logout(res: Response) {
    Token.clearTerminalCookie(res);
    return successRes({ message: 'Chiqildi' }, 200);
  }
}
