import { Module } from '@nestjs/common';
import { RewardController } from './reward.controller';
import { NodeApiModule } from '../node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  controllers: [RewardController],
})
export class RewardModule {}
