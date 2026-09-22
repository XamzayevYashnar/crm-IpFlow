import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in';
import { VerifyOtpDto } from './dto/verify-dto';
import type { Response } from 'express';
import { getCookie } from 'src/common/decorator/getCookie';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign/in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('verify/otp')
  verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response){
    return this.authService.verifyOtp(dto, res);
  }

  @Post('refresh')
  refreshToken(@getCookie('refreshToken') token: string, @Res({ passthrough: true }) res: Response){
    return this.authService.refreshToken(token, res);
  }
}
