import { IPayload } from '../../common/interface/interface-payload';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { conf } from '../../core/config/index';
import { UnauthorizedException } from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { IToken } from "../../common/interface/interface-token"

const DURATION_UNITS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

function durationToMs(value: string, fallbackMs: number): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(value.trim());
  if (!match) {
    return fallbackMs;
  }
  const [, amount, unit] = match;
  return Number(amount) * DURATION_UNITS[unit];
}

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

  static async verifyToken(token: string, type: string) {
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

  static cookieOptions(maxAgeMs: number): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAgeMs,
    };
  }

  static setCookie(
    res: Response,
    accessToken: string,
    refreshToken?: string,
  ): void {
    res.cookie(
      'accessToken',
      accessToken,
      this.cookieOptions(durationToMs(conf.TOKEN.ACCESS_TIME, 15 * 60 * 1000)),
    );
    if (refreshToken) {
      res.cookie(
        'refreshToken',
        refreshToken,
        this.cookieOptions(durationToMs(conf.TOKEN.REFRESH_TIME, 7 * 24 * 60 * 60 * 1000)),
      );
    }
  }

  static clearCookie(res: Response): void {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
  }
}
