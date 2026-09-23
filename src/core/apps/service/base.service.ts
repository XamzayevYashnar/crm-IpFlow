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

    async existsPhone(phone: string): Promise<IUser> {
        const isExists = await this.prisma.user.findUnique({
            where: { phone }
        });

        if (!isExists){
            throw new UnauthorizedException("telefon raqam yoki PIN kod noto'g'ri!");
        };

        return isExists;
    };

    async existsId(id: number) {
        if (!id) {
            throw new UnauthorizedException("Please logIn before continue!");
        }

        const isExists = await this.prisma.user.findUnique({
            where: { id: id }
        });

        if (!isExists){
            throw new UnauthorizedException("user is not exists!");
        }

        return isExists;
    };


    async checkUserRole(roleId: number){
        const userRole = await this.prisma.userRole.findUnique({ where: { id: roleId } });
        
        if (!userRole){
            throw new ForbiddenException("You have'nt got access");
        }

        return userRole;
    }  
    
    async checkUserRoleById(id: number){
        const user = await this.prisma.user.findUnique({ where: { id } });

        const userRole = await this.prisma.userRole.findUnique({ where: { id: user?.roleId } })
        
        if (!userRole){
            throw new ForbiddenException("You have'nt got access");
        }

        return userRole;
    }  
}