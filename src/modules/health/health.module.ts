import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { IsSyncedIndicator } from './gateway.health';
import { StateModule } from '../state/state.module';
import { NodeApiModule } from '../node-api/node-api.module';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule, StateModule, NodeApiModule],
  providers: [IsSyncedIndicator],
})
export class HealthModule {}
