import { Module } from '@nestjs/common';
import { TransactionRepoService } from './transaction-repo.service';
import { TransactionController } from './transaction.controller';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { TransactionService } from './transaction.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccountModule } from 'src/account/account.module';
import { BlockModule } from 'src/block/block.module';

@Module({
  imports: [NodeApiModule, AccountModule, BlockModule],
  providers: [PrismaService, TransactionRepoService, TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
