import { Module } from '@nestjs/common';
import { TransactionRepoService } from './transaction-repo.service';
import { TransactionController } from './transaction.controller';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { TransactionService } from './transaction.service';
import { EventModule } from 'src/event/event.module';
import { StateModule } from 'src/state/state.module';
import { DbCacheModule } from 'src/db-cache/db-cache.module';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [StateModule, NodeApiModule, EventModule, DbCacheModule, AccountModule],
  providers: [TransactionRepoService, TransactionService],
  exports: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
