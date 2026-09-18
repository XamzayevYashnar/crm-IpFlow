import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { conf } from "../../config";

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: conf.TRANSPORT.host,
                port: Number(conf.TRANSPORT.PORT),
                secure: true,
                auth: {
                    user: conf.TRANSPORT.AUTH.user,
                    pass: conf.TRANSPORT.AUTH.password,
                },
            },
            defaults: {
                from: '"No Reply" <xamzayevyashnar060@gmail.com>',
            },
        })
    ],
    providers: [MailService],
    exports: [MailService],
})

export class MailModule {}