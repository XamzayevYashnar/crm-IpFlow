import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in';
import { VerifyOtpDto } from './dto/verify-dto';
import type { Response } from 'express';
import { getCookie } from 'src/common/decorator/getCookie';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign/in')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'Sign in successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('verify/otp')
  @ApiOperation({ summary: 'Verify OTP for user login' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid OTP.' })
  verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response){
    return this.authService.verifyOtp(dto, res);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh auth tokens using refresh token cookie' })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({ status: 200, description: 'Token refreshed successfully.' })
  @ApiResponse({ status: 401, description: 'Refresh token missing or invalid.' })
  refreshToken(@getCookie('refreshToken') token: string, @Res({ passthrough: true }) res: Response){
    return this.authService.refreshToken(token, res);
  }

  @Post('sign/out')
  @ApiOperation({ summary: 'Log out current user' })
  @ApiCookieAuth('accessToken')
  @ApiCookieAuth('refreshToken')
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }
}
