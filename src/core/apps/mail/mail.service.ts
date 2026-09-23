import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { REDIS_CLIENT } from "../../config/redis/redis.module";
import Redis from "ioredis";
import { MailerService } from "@nestjs-modules/mailer";
import { generateOTP } from "../../../infrastructure/helper/otp-generator";
import { getEmailHtml } from "../../../common/public";

const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCK_SECONDS = 5 * 60;

@Injectable()
export class MailService {

    private readonly logger = new Logger(MailService.name);

    constructor (
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        private readonly mailerService: MailerService,
    ){}

    private getOtpKey(email: string): string {
        return `otp:${email.toLowerCase().trim()}`;
    }

    private getOtpFailKey(email: string): string {
        return `otp-fail:${email.toLowerCase().trim()}`;
    }

    private async generateOtpCode(email: string): Promise<string> { 
        const code = generateOTP(); 
        const key = this.getOtpKey(email);
        
        await this.redis.set(key, code, 'EX', 60 * 60 * 24);
        return code; 
    } 

    async sendOtp(to: string) { 
        const cleanEmail = to.toLowerCase().trim();
        const code: any = await this.generateOtpCode(cleanEmail); 

        try {
        const info = await this.mailerService.sendMail({ 
            from: '"My App" <xamzayevyashnar060@gmail.com>', 
            to: cleanEmail,
            subject: `${code} - tasdiqlash kodi`, 
            html: getEmailHtml(code) 
        }); 

        return { success: true, messageId: info.messageId };
        } catch (error) {
        const key = this.getOtpKey(cleanEmail);
        await this.redis.del(key); 
        
        this.logger.error('Emailga OTP kod yuborilmadi', error); 
        throw new InternalServerErrorException('Kod yuborilishida xatolik yuz berdi'); 
        }
    } 

    async verifyOtp(to: string, code: string) {
        const failKey = this.getOtpFailKey(to);
        const fails = Number(await this.redis.get(failKey)) || 0;

        if (fails >= MAX_OTP_ATTEMPTS) {
        throw new ForbiddenException("Juda ko'p noto'g'ri urinish. 5 daqiqadan keyin qayta urinib ko'ring");
        }

        const key = this.getOtpKey(to);
        const stored = await this.redis.get(key);

        if (!stored) {
        throw new BadRequestException('Email topilmadi, kod muddati tugagan yoki avval so‘ralmagan');
        }

        if (stored !== code.trim()) {
        await this.redis.multi().incr(failKey).expire(failKey, OTP_LOCK_SECONDS).exec();
        throw new BadRequestException('Noto‘g‘ri kod kiritildi');
        }

        await this.redis.del(key);
        await this.redis.del(failKey);

        return { verified: true };
    }
}