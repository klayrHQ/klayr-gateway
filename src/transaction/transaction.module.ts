import { Module } from '@nestjs/common';
import { TransactionRepoService } from './transaction-repo.service';
import { TransactionController } from './transaction.controller';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { TransactionService } from './transaction.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventModule } from 'src/event/event.module';
import { StateModule } from 'src/state/state.module';

@Module({
  imports: [StateModule, NodeApiModule, EventModule],
  providers: [PrismaService, TransactionRepoService, TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
