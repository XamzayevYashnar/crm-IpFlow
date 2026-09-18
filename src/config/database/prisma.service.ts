import { Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "../../../generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { conf } from "..";

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
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.warn("DATABASE DISCONNECTED")
    }
}