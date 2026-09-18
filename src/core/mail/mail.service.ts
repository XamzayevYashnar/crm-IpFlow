import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../config/database/prisma.service";

@Injectable()
export class MailService {
    constructor (
        private readonly prisma: PrismaService,
    ){}
}