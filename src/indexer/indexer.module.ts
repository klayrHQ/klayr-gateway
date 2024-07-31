import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { EventModule } from 'src/event/event.module';
import { IndexerRepoService } from './indexer-repo.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IndexerGenesisService } from './indexer-genesis.service';
import { AccountModule } from 'src/account/account.module';
import { StateModule } from 'src/state/state.module';

@Module({
  imports: [StateModule, NodeApiModule, EventModule, AccountModule],
  controllers: [],
  providers: [PrismaService, IndexerRepoService, IndexerService, IndexerGenesisService],
  exports: [IndexerService],
})
export class IndexerModule {}
