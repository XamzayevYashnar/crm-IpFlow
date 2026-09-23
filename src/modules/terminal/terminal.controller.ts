import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { TerminalService } from './terminal.service';
import { PinLoginDto } from './dto/pin-login.dto';

@Controller('terminal')
export class TerminalController {
  constructor(private readonly terminalService: TerminalService) {}

  @Post('login')
  login(@Body() dto: PinLoginDto, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
    return this.terminalService.login(dto, res, req.ip ?? 'unknown');
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.terminalService.logout(res);
  }
}
