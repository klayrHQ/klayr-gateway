import { Module } from '@nestjs/common';
import { ChainEventRepoService } from './chain-event-repo.service';
import { ChainEventController } from './chain-event.controller';
import { ChainEventService } from './chain-event.service';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { EventModule } from 'src/event/event.module';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [NodeApiModule, EventModule, AccountModule],
  providers: [ChainEventRepoService, ChainEventService],
  controllers: [ChainEventController],
  exports: [ChainEventService],
})
export class ChainEventModule {}
