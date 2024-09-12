import { Module } from '@nestjs/common';
import { ChainEventController } from './chain-event.controller';
import { NodeApiModule } from 'src/modules/node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  providers: [],
  controllers: [ChainEventController],
  exports: [],
})
export class ChainEventModule {}
