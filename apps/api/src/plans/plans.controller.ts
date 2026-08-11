import { Body, Controller, Post } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Answers, Plan } from '../shared/types';

class GeneratePlanDto {
  answers!: Answers;
}

@Controller('plans')
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  @Post()
  generate(@Body() body: GeneratePlanDto): Plan {
    return this.plans.generate(body?.answers ?? {});
  }
}
