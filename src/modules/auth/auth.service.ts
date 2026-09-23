import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in';
import { BaseService } from '../../core/apps/service/base.service';
import { Crypt } from '../../infrastructure/lib/Crypt';
import { PrismaService } from '../../core/config/database/prisma.service';
import { MailService } from '../../core/apps/mail/mail.service';
import { successRes } from '../../infrastructure/utils/success-response';
import type { Request, Response } from 'express';
import { VerifyOtpDto } from './dto/verify-dto';
import { generatePayload } from '../../infrastructure/helper/payload-generator';
import { Token } from '../../infrastructure/lib/Token';

@Injectable()
export class AuthService extends BaseService {

  constructor (
    readonly prisma: PrismaService,
    private readonly mail: MailService,
  ){
    super(prisma)
  }

  async signIn(dto: SignInDto){
    const user = await this.existsEmail(dto.email);

    if (!user.password) {
      throw new ForbiddenException("Bu hisob email orqali kira olmaydi");
    }

    const passwordMatches = await Crypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException("email or password is incorrect!");
    }

    await this.mail.sendOtp(dto.email);

    return successRes({ message: "OTP code was successfully sent in gmail" }, 200)
  }

  async verifyOtp(dto: VerifyOtpDto, res: Response){
    const user = await this.existsEmail(dto.email);

    await this.mail.verifyOtp(dto.email, dto.code);

    const userRole = await this.checkUserRole(user.roleId);

    const payload = generatePayload(user.id, userRole.name, user.status);

    const { accessToken, refreshToken } = await Token.getToken(payload);

    Token.setCookie(res, accessToken, refreshToken);

    const { password, ...cleanUser } = user;

    return successRes({ user: cleanUser }, 201);
  }

  async refreshToken(token: string, res: Response){
    const data = await Token.verifyToken(token, 'refresh');
    await this.existsId(data.sub);

    const userRole = await this.checkUserRoleById(data.sub);
    const payload = generatePayload(data.sub, userRole.name, data.status);

    Token.clearCookie(res);
    const result = await Token.getToken(payload);
    Token.setCookie(res, result.accessToken, result.refreshToken);

    return successRes({ message: "Token success updated" }, 201);
  }

  async logout(req: Request, res: Response) {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (accessToken || refreshToken) {
      Token.clearCookie(res);
    }

    return successRes({ message: 'you success logout' }, 200);
  }
}
