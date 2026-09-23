import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { Token } from '../../infrastructure/lib/Token';
import { PrismaService } from '../../core/config/database/prisma.service';
import { IPayload } from '../interface/interface-payload';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: IPayload }>();
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException('Tizimga kirish talab qilinadi');
    }

    const payload = (await Token.verifyToken(token, 'access')) as IPayload;

    // Token ichidagi status/rol faqat login vaqtidagi holatni aks ettiradi —
    // bloklangan foydalanuvchi eski token bilan ishlashda davom etmasligi uchun
    // har bir so'rovda joriy holatni bazadan tekshiramiz.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Hisobingiz faol emas, qaytadan tizimga kiring');
    }

    req.user = payload;

    return true;
  }
}
