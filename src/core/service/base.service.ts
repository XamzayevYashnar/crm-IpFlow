import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../config/database/prisma.service";

@Injectable()
export class BaseService {

    constructor (
        private readonly prisma: PrismaService,
    ){}

    async existsEmail(email: string): Promise<void> {
        const isExists = await this.prisma.user.findUnique({
            where: { email }
        });

        if (!isExists){
            throw new UnauthorizedException("email or password is incorrect!");
        };
    };
    
}