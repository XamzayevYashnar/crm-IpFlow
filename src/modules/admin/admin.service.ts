import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { BaseService } from '../../core/apps/service/base.service';
import { PrismaService } from '../../core/config/database/prisma.service';
import { Crypt } from '../../infrastructure/lib/Crypt';
import { successRes } from '../../infrastructure/utils/success-response';
import { UserStatus } from '../../../generated/prisma/enums';
import { conf } from '../../core/config';

@Injectable()
export class AdminService extends BaseService {
  constructor(readonly prisma: PrismaService) {
    super(prisma);
  }

  async create(dto: CreateAdminDto) {
    await this.checkUserRole(dto.roleId);

    const emailTaken = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (emailTaken) {
      throw new ConflictException('This email is already in use');
    }

    const hashedPassword = await Crypt.hash(dto.password);

    const admin = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        roleId: dto.roleId,
        status: UserStatus.ACTIVE,
      },
    });

    const { password, ...cleanAdmin } = admin;

    return successRes({ admin: cleanAdmin }, 201);
  }

  async findAll() {
    const admins = await this.prisma.user.findMany({
      where: { role: { name: { not: conf.ROLE_NAME } } },
      include: { role: true },
    });

    const cleanAdmins = admins.map(({ password, ...admin }) => admin);

    return successRes({ admins: cleanAdmins }, 200);
  }

  async findOne(id: number) {
    const admin = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin #${id} is not found`);
    }

    const { password, ...cleanAdmin } = admin;

    return successRes({ admin: cleanAdmin }, 200);
  }

  async update(id: number, dto: UpdateAdminDto) {
    await this.findOne(id);

    if (dto.roleId) {
      await this.checkUserRole(dto.roleId);
    }

    if (dto.password) {
      dto.password = await Crypt.hash(dto.password);
    }

    const updatedAdmin = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    const { password, ...cleanAdmin } = updatedAdmin;

    return successRes({ admin: cleanAdmin }, 200);
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.BLOCKED },
    });

    return successRes({ message: 'Admin is successfully blocked' }, 200);
  }
}
