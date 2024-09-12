import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { NodeApiModule } from 'src/modules/node-api/node-api.module';
import { IndexGenesisBlockHandler } from './commands/startup/genesis-index.command';
import { StateModule } from 'src/modules/state/state.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { EventIndexService } from './event/event-index.service';
import { CqrsModule } from '@nestjs/cqrs';
import { CheckForBlockFinalityHandler } from './commands/post-block-event/check-block-finality.command';
import { UpdateBlockGeneratorHandler } from './commands/post-block-event/update-block-generator.command';
import { UpdateBlocksFeeHandler } from './commands/post-block-event/update-block-fee.command';
import { IndexKnownAccountsHandler } from './commands/startup/known-accounts.command';
import { IndexBlockHandler } from './commands/block-event/block-index.command';
import { IndexTransactionHandler } from './commands/block-event/transaction-index.command';
import { IndexAssetHandler } from './commands/block-event/asset-index.command';
import { ExecutionResultHandler } from './event/commands/execution-result.command';
import { ProcessValidatorHandler } from './event/commands/process-validator.command';
import { AddStakesHandler } from './event/commands/add-stakes.command';

@Module({
  imports: [CqrsModule, StateModule, NodeApiModule],
  controllers: [],
  providers: [
    PrismaService,
    IndexerService,
    EventIndexService,

    // startup commands
    IndexKnownAccountsHandler,
    IndexGenesisBlockHandler,

    // main indexer commands
    IndexBlockHandler,
    IndexTransactionHandler,
    IndexAssetHandler,

    // after block events commands
    CheckForBlockFinalityHandler,
    UpdateBlockGeneratorHandler,
    UpdateBlocksFeeHandler,

    // chain events commands
    ExecutionResultHandler,
    ProcessValidatorHandler,
    AddStakesHandler,
  ],
  exports: [IndexerService],
})
export class IndexerModule {}
