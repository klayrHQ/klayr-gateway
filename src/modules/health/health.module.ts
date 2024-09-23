import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { IsSyncedIndicator } from './gateway.health';
import { StateModule } from '../state/state.module';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule, StateModule],
  providers: [IsSyncedIndicator],
})
export class HealthModule {}
