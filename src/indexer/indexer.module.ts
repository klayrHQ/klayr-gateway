import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { EventModule } from 'src/event/event.module';
import { GenesisIndexService } from './startup/genesis-index.service';
import { AccountModule } from 'src/account/account.module';
import { StateModule } from 'src/state/state.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockIndexService } from './block/block-index.service';
import { TransactionIndexService } from './block/transaction-index.service';
import { IndexExtraService } from './startup/indexer-extra.service';
import { ChainEventIndexService } from './chain-event/chain-event-index.service';
import { ValidatorEventService } from './chain-event/validator/validator-event.service';
import { CqrsModule } from '@nestjs/cqrs';
import { CheckForBlockFinalityHandler } from './after-block/check-block-finality.command';
import { AssetIndexService } from './block/asset-index.service';
import { UpdateBlockGeneratorHandler } from './after-block/update-block-generator.command';
import { UpdateBlocksFeeHandler } from './after-block/update-block-fee.command';

@Module({
  imports: [CqrsModule, StateModule, NodeApiModule, EventModule, AccountModule],
  controllers: [],
  providers: [
    PrismaService,
    IndexerService,
    GenesisIndexService,
    IndexExtraService,
    BlockIndexService,
    TransactionIndexService,
    ChainEventIndexService,
    ValidatorEventService,
    AssetIndexService,

    CheckForBlockFinalityHandler,
    UpdateBlockGeneratorHandler,
    UpdateBlocksFeeHandler,
  ],
  exports: [IndexerService],
})
export class IndexerModule {}
