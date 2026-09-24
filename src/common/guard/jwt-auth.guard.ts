import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Token } from '../../infrastructure/lib/Token';
import { PrismaService } from '../../core/config/database/prisma.service';
import { IPayload } from '../interface/interface-payload';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { Role } from '../../../generated/prisma/enums';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: IPayload }>();

    // Admin (email/OTP) va terminal (PIN) sessiyalari bir xil brauzerda bir-birini
    // ustidan yozib qo'ymasligi uchun alohida cookie nomlarida saqlanadi. Qaysi
    // cookie ishlatilishi shu route qaysi rol(lar)ga ochiqligiga bog'liq — faqat
    // STAFF uchun ochiq route terminal cookie'sini ustuvor qiladi, aks holda admin
    // cookie'si ustuvor bo'ladi (ikkalasi ham fallback sifatida tekshiriladi).
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const staffOnly = !!requiredRoles?.length && requiredRoles.every((r) => r === Role.STAFF);

    const token = staffOnly
      ? (req.cookies?.terminalAccessToken ?? req.cookies?.accessToken)
      : (req.cookies?.accessToken ?? req.cookies?.terminalAccessToken);

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
