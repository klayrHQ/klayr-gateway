import { Module } from '@nestjs/common';
import { FeesController } from './fees.controller';
import { NodeApiModule } from '../node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  controllers: [FeesController],
})
export class FeesModule {}
