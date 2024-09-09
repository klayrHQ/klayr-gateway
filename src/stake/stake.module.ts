import { Module } from '@nestjs/common';
import { StakeService } from './stake.service';
import { StakeRepoService } from './stake-repo.service';
import { NodeApiModule } from 'src/node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  providers: [StakeService, StakeRepoService],
  exports: [StakeService, StakeRepoService],
})
export class StakeModule {}
