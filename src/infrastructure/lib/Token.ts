import { IPayload } from '../../common/interface/interface-payload';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { conf } from '../../core/config/index';
import { UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { IToken } from "../../common/interface/interface-token"

export class Token {
  private static readonly jwt = new JwtService();

  static async getToken(payload: IPayload): Promise<IToken> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: conf.TOKEN.ACCESS_KEY,
        expiresIn: conf.TOKEN.ACCESS_TIME as JwtSignOptions['expiresIn'],
      }),
      this.jwt.signAsync(payload, {
        secret: conf.TOKEN.REFRESH_KEY,
        expiresIn: conf.TOKEN.REFRESH_TIME as JwtSignOptions['expiresIn'],
      }),
    ]);
    return { accessToken, refreshToken };
  }

  static async verifyToken(token: string, type: string): Promise<object> {
    try {
      const verifiedData = await this.jwt.verifyAsync(token, {
        secret:
          type === 'access' ? conf.TOKEN.ACCESS_KEY : conf.TOKEN.REFRESH_KEY,
      });
      return verifiedData;
    } catch (error) {
      throw new UnauthorizedException('Tizimga kirishda nosozlik');
    }
  }

  static setCookie(
    res: Response,
    accessToken: string,
    refreshToken?: string,
  ): void {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: parseInt(conf.TOKEN.ACCESS_TIME) * 24 * 60 * 60 * 1000,
    });
    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: parseInt(conf.TOKEN.REFRESH_TIME) * 24 * 60 * 60 * 1000,
      });
    }
  }

  static clearCookie(res: Response): void {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
  }
}