import { apiClient } from '@klayr/client';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { NODE_URL, RETRY_TIMEOUT } from 'src/utils/constants';
import { waitTimeout } from 'src/utils/helpers';
import { Block, NewBlockEvent, NodeInfo } from './types';

export enum NodeApi {
  SYSTEM_GET_NODE_INFO = 'system_getNodeInfo',
  CHAIN_NEW_BLOCK = 'chain_newBlock',
  CHAIN_GET_BLOCK_BY_ID = 'chain_getBlockByID',
  CHAIN_GET_BLOCKS_BY_HEIGHT = 'chain_getBlocksByHeightBetween',
}

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

  public async invokeApi<T>(endpoint: string, params: any): Promise<T> {
    return this.client.invoke<T>(endpoint, params).catch((err) => {
      this.logger.error(err);
      throw new Error(`Failed invoking ${endpoint}`);
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
