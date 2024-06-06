import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { EventModule } from 'src/event/event.module';
import { IndexerRepoService } from './indexer-repo.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IndexerGenesisService } from './indexer-genesis.service';
import { ValidatorModule } from 'src/validator/validator.module';

@Module({
  imports: [NodeApiModule, EventModule, ValidatorModule],
  controllers: [],
  providers: [PrismaService, IndexerRepoService, IndexerService, IndexerGenesisService],
})
export class IndexerModule {}
