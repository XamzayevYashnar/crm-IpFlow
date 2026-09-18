import { Module } from '@nestjs/common';
import { PrismaModule } from './core/config/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { MailModule } from './core/apps/mail/mail.module';
import { BaseModule } from './core/apps/service/base.module';
import { RedisModule } from './core/config/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminModule, 
    MailModule,
    BaseModule,
    RedisModule,
  ],
})
export class AppModule {}
