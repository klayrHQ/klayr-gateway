import { Module } from '@nestjs/common';
import { ValidatorRepoService } from './validator.repo-service';
import { ValidatorService } from './validator.service';
import { ValidatorController } from './validator.controller';
import { AccountModule } from 'src/account/account.module';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { StateModule } from 'src/state/state.module';
import { DbCacheModule } from 'src/db-cache/db-cache.module';
import { BlockModule } from 'src/block/block.module';

@Module({
  imports: [StateModule, AccountModule, NodeApiModule, DbCacheModule, BlockModule],
  providers: [ValidatorRepoService, ValidatorService],
  exports: [ValidatorService, ValidatorRepoService],
  controllers: [ValidatorController],
})
export class ValidatorModule {}
