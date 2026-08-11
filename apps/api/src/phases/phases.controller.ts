import { Controller, Get } from '@nestjs/common';
import { PhasesService } from './phases.service';
import { Phase } from '../shared/types';

@Controller('phases')
export class PhasesController {
  constructor(private readonly phases: PhasesService) {}

  @Get()
  findAll(): Phase[] {
    return this.phases.findAll();
  }
}
