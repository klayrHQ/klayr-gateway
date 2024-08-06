import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockRepoService } from './block-repo.service';
import { BlockController } from './block.controller';
import { EventModule } from 'src/event/event.module';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { ChainEventModule } from 'src/chain-event/chain-event.module';
import { StateModule } from 'src/state/state.module';
import { DbCacheModule } from 'src/db-cache/db-cache.module';

@Module({
  imports: [StateModule, EventModule, NodeApiModule, ChainEventModule, DbCacheModule],
  providers: [PrismaService, BlockService, BlockRepoService],
  controllers: [BlockController],
  exports: [BlockService],
})
export class BlockModule {}
