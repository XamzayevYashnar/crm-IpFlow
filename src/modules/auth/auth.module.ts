import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BaseModule } from '../../core/service/base.module';
import { MailModule } from '../../core/mail/mail.module';

@Module({
  imports: [BaseModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
