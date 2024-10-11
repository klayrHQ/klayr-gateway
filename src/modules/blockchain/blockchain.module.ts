import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { GithubService } from './github.service';
import { BlockchainController } from './blockchain.controller';

@Module({
  providers: [BlockchainService, GithubService],
  controllers: [BlockchainController],
})
export class BlockchainModule {}
