import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in';
import { BaseService } from '../../core/apps/service/base.service';
import { Crypt } from '../../infrastructure/lib/Crypt';
import { PrismaService } from '../../core/config/database/prisma.service';
import { MailService } from '../../core/apps/mail/mail.service';
import { successRes } from '../../infrastructure/utils/success-response';
import type { Response } from 'express'
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

    await Crypt.compare(dto.password, user.password);

    await this.mail.sendOtp(dto.email);

    return successRes({ message: "OTP code was successfully sent in gmail" }, 200)
  }

  async verifyOtp(dto: VerifyOtpDto, res: Response){
    const user = await this.existsEmail(dto.email);

    await this.mail.verifyOtp(dto.email, dto.code);

    const payload = generatePayload(user.id, user.role, user.status);

    const { accessToken, refreshToken } = await Token.getToken(payload);

    Token.setCookie(res, accessToken, refreshToken);

    const { password, ...cleanUser } = user;

    return successRes({ user: cleanUser }, 201);
  }
}
