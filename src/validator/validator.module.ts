import { Module } from '@nestjs/common';
import { ValidatorRepoService } from './validator.repo-service';
import { ValidatorService } from './validator.service';
import { ValidatorController } from './validator.controller';
import { AccountModule } from 'src/account/account.module';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { StateModule } from 'src/state/state.module';
import { BlockModule } from 'src/block/block.module';
import { StakeModule } from 'src/stake/stake.module';

@Module({
  imports: [StateModule, AccountModule, NodeApiModule, BlockModule, StakeModule],
  providers: [ValidatorRepoService, ValidatorService],
  exports: [ValidatorService, ValidatorRepoService],
  controllers: [ValidatorController],
})
export class ValidatorModule {}
