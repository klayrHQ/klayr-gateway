import { Module } from '@nestjs/common';
import { ValidatorRepoService } from './validator.repo-service';
import { ValidatorService } from './validator.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidatorController } from './validator.controller';
import { AccountModule } from 'src/account/account.module';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { IndexerModule } from 'src/indexer/indexer.module';

@Module({
  imports: [AccountModule, NodeApiModule, IndexerModule],
  providers: [ValidatorRepoService, ValidatorService, PrismaService],
  exports: [ValidatorService],
  controllers: [ValidatorController],
})
export class ValidatorModule {}
