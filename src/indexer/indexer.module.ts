import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { EventModule } from 'src/event/event.module';
import { IndexerRepoService } from './indexer-repo.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IndexerGenesisService } from './indexer-genesis.service';
import { ValidatorModule } from 'src/validator/validator.module';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [NodeApiModule, EventModule, ValidatorModule, AccountModule],
  controllers: [],
  providers: [PrismaService, IndexerRepoService, IndexerService, IndexerGenesisService],
})
export class IndexerModule {}
