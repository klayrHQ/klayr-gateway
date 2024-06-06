import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { EventModule } from 'src/event/event.module';
import { IndexerRepoService } from './indexer-repo.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { InderGenesisService } from './indexer-genesis.service';

@Module({
  imports: [NodeApiModule, EventModule],
  controllers: [],
  providers: [PrismaService, IndexerRepoService, IndexerService, InderGenesisService],
})
export class IndexerModule {}
