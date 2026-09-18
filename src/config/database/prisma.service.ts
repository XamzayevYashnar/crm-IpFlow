import { Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient, Role, UserStatus } from "../../../generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { conf } from "..";
import { Crypt } from "../../infrastructure/lib/Crypt";

export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        const pool = new Pool({ connectionString: conf.DATABASE_URL });
        const adapter = new PrismaPg(pool);

        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log("DATABASE CONNECTED");

        const superAdmin = await this.user.findFirst({
            where: { role: Role.SUPER_ADMIN }
        });

        if (!superAdmin){

            const hashPassword: string = await Crypt.hash(conf.ADMIN.password);

            await this.user.create({
                data: {
                    email: conf.ADMIN.email,
                    password: hashPassword,   
                    role: Role.SUPER_ADMIN, 
                    status: UserStatus.ACTIVE,                 
                }
            });
            
        };

        this.logger.log(superAdmin);
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.warn("DATABASE DISCONNECTED")
    }
}