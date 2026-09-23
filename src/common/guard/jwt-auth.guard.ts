import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { Token } from '../../infrastructure/lib/Token';
import { IPayload } from '../interface/interface-payload';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: IPayload }>();
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException('Tizimga kirish talab qilinadi');
    }

    req.user = (await Token.verifyToken(token, 'access')) as IPayload;

    return true;
  }
}
