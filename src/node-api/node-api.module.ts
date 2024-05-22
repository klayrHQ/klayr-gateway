import { Module } from '@nestjs/common';
import { NodeApiService } from './node-api.service';

@Module({
  providers: [NodeApiService],
  exports: [NodeApiService],
})
export class NodeApiModule {}
