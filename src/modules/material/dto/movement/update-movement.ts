import { PartialType } from '@nestjs/swagger';
import { CreateMovementDto } from './create-movement';

export class UpdateMovement extends PartialType(CreateMovementDto) {}
