import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { NodeApiModule } from 'src/modules/node-api/node-api.module';
import { IndexGenesisBlockHandler } from './startup/genesis-index.command';
import { StateModule } from 'src/modules/state/state.module';
import { EventIndexService } from './event/event-index.service';
import { CqrsModule } from '@nestjs/cqrs';
import { CheckForBlockFinalityHandler } from './block/post-block-commands/check-block-finality.command';
import { UpdateBlockGeneratorHandler } from './block/post-block-commands/update-block-generator.command';
import { UpdateBlocksFeeHandler } from './block/post-block-commands/update-block-fee.command';
import { IndexKnownAccountsHandler } from './startup/known-accounts.command';
import { IndexBlockHandler } from './block/block-commands/block-index.command';
import { IndexTransactionHandler } from './block/block-commands/transaction-index.command';
import { IndexAssetHandler } from './block/block-commands/asset-index.command';
import { ExecutionResultHandler } from './event/commands/execution-result.command';
import { ProcessValidatorHandler } from './event/commands/process-validator.command';
import { AddStakesHandler } from './event/commands/add-stakes.command';
import { UpdateValidatorRanksHandler } from './event/commands/update-validator-ranks.command';
import { UpdateAccountHandler } from './event/commands/update-account.command';
import { UpdateSidechainHandler } from './event/commands/update-sidechain.command';
import { SaveNetworkPeersHandler } from './block/post-block-commands/save-network-peers.command';
import { CheckValidatorStatusHandler } from './block/post-block-commands/check-validator-status.command';

@Module({
  imports: [CqrsModule, StateModule, NodeApiModule],
  controllers: [],
  providers: [
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
    SaveNetworkPeersHandler,
    CheckValidatorStatusHandler,

    // chain events commands
    ExecutionResultHandler,
    ProcessValidatorHandler,
    AddStakesHandler,
    UpdateValidatorRanksHandler,
    UpdateAccountHandler,
    UpdateSidechainHandler,
  ],
  exports: [IndexerService],
})
export class IndexerModule {}
