import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient, UserStatus, PermissionAction } from "../../../../generated/prisma/client"; 
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { conf } from "..";
import { Crypt } from "../../../infrastructure/lib/Crypt";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    const pool = new Pool({ connectionString: String(conf.DATABASE_URL) });
    const adapter = new PrismaPg(pool);
    
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("DATABASE CONNECTED");

      this.logger.log("Initializing permissions from enum...");
      const actions = Object.values(PermissionAction);
      
      for (const action of actions) {
        await this.permission.upsert({
          where: { action: action },
          update: {},
          create: { action: action },
        });
      }
      this.logger.log("Permissions successfully synchronized");

      let roleExists = await this.userRole.findUnique({
        where: { name: conf.ROLE_NAME },
        include: { permissions: true },
      });

      if (!roleExists) {
        roleExists = await this.userRole.create({
          data: { 
            name: conf.ROLE_NAME,
            permissions: {
              connect: actions.map(action => ({ action }))
            }
          },
          include: { permissions: true }
        });
        this.logger.log(`UserRole (${conf.ROLE_NAME}) successfully created with all permissions`);
      }

      let superAdmin = await this.user.findUnique({
        where: { email: String(conf.ADMIN.email) }
      });

      if (!superAdmin) {
        const hashPassword = await Crypt.hash(String(conf.ADMIN.password));
        superAdmin = await this.user.create({
          data: {
            email: String(conf.ADMIN.email),
            password: hashPassword,
            roleId: roleExists.id,
            status: UserStatus.ACTIVE,
          }
        });
        this.logger.log("Super Admin account successfully created");
      }

      this.logger.log(`Current Super Admin ID: ${superAdmin.id}`);
    } catch (error) {
      this.logger.error("Database seed and initialization failed", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
    this.logger.warn("DATABASE DISCONNECTED");
  }
}
