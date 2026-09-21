import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../config/database/prisma.service";
import { IUser } from "../../../common/interface/interface-user";

@Injectable()
export class BaseService {

    constructor (
        readonly prisma: PrismaService,
    ){}

    async existsEmail(email: string): Promise<IUser> {
        const isExists = await this.prisma.user.findUnique({
            where: { email }
        });

        if (!isExists){
            throw new UnauthorizedException("email or password is incorrect!");
        };

        return isExists;
    };

    async checkUserRole(roleId: number){
        const userRole = await this.prisma.userRole.findUnique({ where: { id: roleId } });
        
        if (!userRole){
            throw new ForbiddenException("You have'nt got access");
        }

        return userRole;
    }
    
}