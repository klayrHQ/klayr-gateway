import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockRepoService } from './block-repo.service';
import { BlockController } from './block.controller';
import { EventModule } from 'src/event/event.module';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { ChainEventModule } from 'src/chain-event/chain-event.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [EventModule, TransactionModule, NodeApiModule, ChainEventModule],
  providers: [BlockService, BlockRepoService],
  controllers: [BlockController],
  exports: [BlockService, BlockRepoService],
})
export class BlockModule {}
