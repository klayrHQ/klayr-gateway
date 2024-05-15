import { apiClient } from '@klayr/client';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class IndexerService {
  nodeUrl: string = 'ws://localhost:7887/rpc-ws';
  client: apiClient.APIClient;

  constructor(private eventEmitter: EventEmitter2) {}

  async onModuleInit() {
    try {
      this.client = await apiClient.createWSClient(this.nodeUrl);
    } catch (err) {
      console.error('Error connecting to the node:', err);
    }

    await this.subscribeToNewBlock();
  }

  emitEvent() {
    this.eventEmitter.emit('blocki', {
      orderId: 1,
      payload: { name: 'John Doe' },
    });
  }

  async subscribeToNewBlock() {
    try {
      this.client.subscribe('chain_newBlock', async (data: unknown) => {
        const newBlockData = data as NewBlock;
        console.log(newBlockData);
        this.emitEvent();
      });
    } catch (error) {
      console.error('Failed to subscribe, retrying...', error);
      await new Promise((resolve) => setTimeout(resolve, 4000)); // wait for 5 seconds before retrying
      this.subscribeToNewBlock();
    }
  }
}
