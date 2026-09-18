import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BaseModule } from '../../core/apps/service/base.module';
import { MailModule } from '../../core/apps/mail/mail.module';

@Module({
  imports: [BaseModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
