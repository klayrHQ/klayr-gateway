import { Module } from '@nestjs/common';
import { TransactionRepoService } from './transaction-repo.service';
import { TransactionController } from './transaction.controller';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { TransactionService } from './transaction.service';
import { EventModule } from 'src/event/event.module';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [NodeApiModule, EventModule, AccountModule],
  providers: [TransactionRepoService, TransactionService],
  exports: [TransactionService, TransactionRepoService],
  controllers: [TransactionController],
})
export class TransactionModule {}
