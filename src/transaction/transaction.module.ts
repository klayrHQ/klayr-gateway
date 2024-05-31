import { Module } from '@nestjs/common';
import { TransactionRepoService } from './transaction-repo.service';
import { TransactionController } from './transaction.controller';

@Module({
  providers: [TransactionRepoService],
  controllers: [TransactionController],
})
export class TransactionModule {}
