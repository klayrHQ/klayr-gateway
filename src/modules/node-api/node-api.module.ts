import { Module } from '@nestjs/common';
import { NodeApiService } from './node-api.service';
import { NodeApiController } from './node-api.controller';
import { WebSocketClientService } from './websocket/websocket.service';
import { StatusController } from './status.controller';

@Module({
  providers: [WebSocketClientService, NodeApiService],
  exports: [NodeApiService],
  controllers: [NodeApiController, StatusController],
})
export class NodeApiModule {}
