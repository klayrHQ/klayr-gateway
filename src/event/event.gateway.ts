import { OnEvent } from '@nestjs/event-emitter';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Block } from 'src/node-api/types';
import { Events } from './event.service';
import { Logger } from '@nestjs/common';

// Websocket gateway to emit events to the client
@WebSocketGateway({
  cors: {
    origin: '*', // TODO: Change this to the actual origin, later
  },
})
export class EventGateway {
  private readonly logger = new Logger(EventGateway.name);

  @WebSocketServer()
  server: Server;

  @OnEvent(Events.NEW_BLOCK_EVENT)
  emitNewBlockEvent(payload: Block) {
    if (!this.server) return this.logger.error('Server is not initialized');
    this.server.emit(Events.NEW_BLOCK_EVENT, payload);
  }
}
