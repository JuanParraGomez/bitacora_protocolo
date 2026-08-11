import { Injectable } from '@nestjs/common';
import { PHASES } from './phases.data';
import { Phase } from '../shared/types';

@Injectable()
export class PhasesService {
  findAll(): Phase[] {
    return PHASES;
  }
}
