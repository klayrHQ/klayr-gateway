import { Module } from '@nestjs/common';
import { NodeApiService } from './node-api.service';
import { NodeApiController } from './node-api.controller';

@Module({
  providers: [NodeApiService],
  exports: [NodeApiService],
  controllers: [NodeApiController],
})
export class NodeApiModule {}
