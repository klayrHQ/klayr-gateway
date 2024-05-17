import { apiClient } from '@klayr/client';
import { Injectable, Logger } from '@nestjs/common';
import { NODE_URL, NodeApi, RETRY_TIMEOUT } from 'src/utils/constants';
import { timeout } from 'src/utils/helpers';
import { BlockByHeight, NewBlockEvent, NodeInfo } from './types';

// Functions to interact with the Node API
@Injectable()
export class NodeApiService {
  public readonly logger = new Logger(NodeApiService.name);
  private client: apiClient.APIClient;

  async onModuleInit() {
    await this.connectToNode();
  }

  private async connectToNode() {
    while (!this.client) {
      this.client = await apiClient.createWSClient(NODE_URL).catch(async (err) => {
        this.logger.error('Failed connecting to node, retrying...', err);
        await timeout(RETRY_TIMEOUT);
        return null;
      });
    }
  }

  // What to do when this fails?
  /////////
  public async getBlocksFromNode(args: { from: number; to: number }): Promise<BlockByHeight[]> {
    const blocks = await this.client
      .invoke<BlockByHeight[]>(NodeApi.CHAIN_GET_BLOCKS_BY_HEIGHT, {
        from: args.from,
        to: args.to,
      })
      .catch((err) => {
        this.logger.error('Failed getting blocks');
        throw new Error(err);
      });
    return blocks.reverse();
  }

  // What to do when this fails?
  /////////
  public async getNodeInfo(): Promise<NodeInfo> {
    return this.client.invoke<NodeInfo>(NodeApi.SYSTEM_GET_NODE_INFO).catch((err) => {
      this.logger.error('Failed getting node info');
      throw new Error(err);
    });
  }

  // Have to avoid retrying here cause of memory leaks
  ////////////
  public subscribeToNewBlock(callback: (data: NewBlockEvent) => void): void {
    try {
      this.client.subscribe(NodeApi.CHAIN_NEW_BLOCK, async (data: unknown) => {
        const newBlockData = data as NewBlockEvent;
        callback(newBlockData);
      });
    } catch (err) {
      this.logger.error('Failed to subscribe', err);
      throw new Error(err);
    }
  }
}
