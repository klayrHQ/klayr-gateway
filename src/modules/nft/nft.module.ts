import { Module } from '@nestjs/common';
import { NftController } from './nft.controller';
import { NodeApiModule } from '../node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  controllers: [NftController],
})
export class NftModule {}
