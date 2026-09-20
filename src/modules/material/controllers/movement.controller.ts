import { Controller } from '@nestjs/common';
import { MaterialService } from '../services/material.service';

@Controller('movement')
export class MovementController {
  constructor(private readonly materialService: MaterialService) {}
}
