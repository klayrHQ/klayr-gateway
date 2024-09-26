import { Module } from '@nestjs/common';
import { NetworkController } from './network.controller';
import { NodeApiModule } from '../node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  controllers: [NetworkController],
})
export class NetworkModule {}
