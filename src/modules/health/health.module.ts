import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { IsSyncedIndicator } from './gateway.health';
import { NodeApiModule } from '../node-api/node-api.module';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule, NodeApiModule],
  providers: [IsSyncedIndicator],
})
export class HealthModule {}
