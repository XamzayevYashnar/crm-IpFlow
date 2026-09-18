import { Module } from '@nestjs/common';
import { PrismaModule } from './config/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { MailModule } from './core/mail/mail.module';
import { BaseModule } from './core/service/base.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminModule, 
    MailModule,
    BaseModule,
  ],
})
export class AppModule {}
