import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { EventModule } from 'src/event/event.module';
import { GenesisIndexService } from './genesis/genesis-index.service';
import { AccountModule } from 'src/account/account.module';
import { StateModule } from 'src/state/state.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockIndexService } from './block/block-index.service';
import { TransactionIndexService } from './transaction/transaction-index.service';
import { IndexExtraService } from './extra/indexer-extra.service';
import { ChainEventIndexService } from './chain-event/chain-event-index.service';

@Module({
  imports: [StateModule, NodeApiModule, EventModule, AccountModule],
  controllers: [],
  providers: [
    PrismaService,
    IndexerService,
    GenesisIndexService,
    IndexExtraService,
    BlockIndexService,
    TransactionIndexService,
    ChainEventIndexService,
  ],
  exports: [IndexerService],
})
export class IndexerModule {}
