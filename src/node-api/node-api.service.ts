import { apiClient } from '@klayr/client';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { NODE_URL, NodeApi, RETRY_TIMEOUT } from 'src/utils/constants';
import { waitTimeout } from 'src/utils/helpers';
import { Block, NewBlockEvent, NodeInfo } from './types';

// Functions to interact with the Node API
@Injectable()
export class NodeApiService {
  private readonly logger = new Logger(NodeApiService.name);
  private client: apiClient.APIClient;

  async onModuleInit() {
    await this.connectToNode();
  }

  private async connectToNode() {
    while (!this.client) {
      this.client = await apiClient.createWSClient(NODE_URL).catch(async (err) => {
        this.logger.error('Failed connecting to node, retrying...', err);
        await waitTimeout(RETRY_TIMEOUT);
        return null;
      });
    }
  }

  // TODO: Decide on error handling
  public async getBlockById(id: string): Promise<Block> {
    return this.client
      .invoke<Block>(NodeApi.CHAIN_GET_BLOCK_BY_ID, {
        id,
      })
      .catch((err) => {
        this.logger.error(err);
        throw new Error('Failed getting block by id');
      });
  }

  // TODO: Decide on error handling
  public async getBlocksFromNode(args: { from: number; to: number }): Promise<Block[]> {
    return this.client
      .invoke<Block[]>(NodeApi.CHAIN_GET_BLOCKS_BY_HEIGHT, {
        from: args.from,
        to: args.to,
      })
      .catch((err) => {
        this.logger.error(err);
        throw new InternalServerErrorException('Failed to get blocks');
      });
  }

  // TODO: Decide on error handling
  public async getNodeInfo(): Promise<NodeInfo> {
    return this.client.invoke<NodeInfo>(NodeApi.SYSTEM_GET_NODE_INFO).catch((err) => {
      this.logger.error(err);
      throw new InternalServerErrorException('Failed to get node info');
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
      this.logger.error(err);
      throw new InternalServerErrorException('Failed to subscribe');
    }
  }
}
