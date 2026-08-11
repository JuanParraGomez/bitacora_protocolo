import { Module } from '@nestjs/common';
import { PhasesModule } from './phases/phases.module';
import { PlansModule } from './plans/plans.module';

@Module({
  imports: [PhasesModule, PlansModule],
})
export class AppModule {}
