import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { EventModule } from 'src/event/event.module';
import { IndexGenesisBlockHandler } from './commands/startup/genesis-index.command';
import { AccountModule } from 'src/account/account.module';
import { StateModule } from 'src/state/state.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChainEventIndexService } from './chain-event/chain-event-index.service';
import { ValidatorEventService } from './chain-event/validator/validator-event.service';
import { CqrsModule } from '@nestjs/cqrs';
import { CheckForBlockFinalityHandler } from './commands/after-block-event/check-block-finality.command';
import { UpdateBlockGeneratorHandler } from './commands/after-block-event/update-block-generator.command';
import { UpdateBlocksFeeHandler } from './commands/after-block-event/update-block-fee.command';
import { IndexKnownAccountsHandler } from './commands/startup/known-accounts.command';
import { IndexBlockHandler } from './commands/block-event/block-index.command';
import { IndexTransactionHandler } from './commands/block-event/transaction-index.command';
import { IndexAssetHandler } from './commands/block-event/asset-index.command';

@Module({
  imports: [CqrsModule, StateModule, NodeApiModule, EventModule, AccountModule],
  controllers: [],
  providers: [
    PrismaService,
    IndexerService,
    ChainEventIndexService,
    ValidatorEventService,

    IndexBlockHandler,
    IndexTransactionHandler,
    IndexAssetHandler,
    CheckForBlockFinalityHandler,
    UpdateBlockGeneratorHandler,
    UpdateBlocksFeeHandler,
    IndexKnownAccountsHandler,
    IndexGenesisBlockHandler,
  ],
  exports: [IndexerService],
})
export class IndexerModule {}
