import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/config/database/prisma.service';

@Injectable()
export class MovementService {
  constructor(private readonly prisma: PrismaService) {}
}