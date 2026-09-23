import { Module } from '@nestjs/common';
import { TerminalService } from './terminal.service';
import { TerminalController } from './terminal.controller';

@Module({
  controllers: [TerminalController],
  providers: [TerminalService],
})
export class TerminalModule {}
