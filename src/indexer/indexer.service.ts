import { apiClient } from '@klayr/client';
import { Injectable, Logger } from '@nestjs/common';
import {
  NODE_URL,
  NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE,
  NodeApi,
  RETRY_TIMEOUT,
} from 'src/utils/constants';
import { timeout } from 'src/utils/helpers';
import { BlockByHeight, NewBlockEvent, NodeInfo } from './types';

export enum IndexerState {
  SYNCING,
  INDEXING,
}

@Injectable()
export class IndexerService {
  readonly logger = new Logger(IndexerService.name);
  private client: apiClient.APIClient;
  public syncedBlockHeight: number; // Probably will go to DB?

  public state: IndexerState;

  constructor() {
    this.state = IndexerState.SYNCING;
  }

  async onModuleInit() {
    await this.connectToNode();
    const nodeInfo = await this.getNodeInfo();
    this.syncedBlockHeight = nodeInfo.genesisHeight;

    // will let nestjs startup first
    // setImmediate(() => this.syncWithNode());
    this.subscribeToNewBlock();
  }

  private async connectToNode() {
    while (!this.client) {
      this.client = await apiClient
        .createWSClient(NODE_URL)
        .catch(async (err) => {
          this.logger.error('Failed connecting to node, retrying...', err);
          await timeout(RETRY_TIMEOUT);
          return null;
        });
    }
  }

  private async syncWithNode() {
    while (this.state === IndexerState.SYNCING) {
      const nodeInfo = await this.getNodeInfo();
      const blockHeightTo =
        this.syncedBlockHeight + NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE;
      const blocks = await this.getBlocksFromNode(blockHeightTo);
      this.newBlockByHeight(blocks);
      this.syncedBlockHeight = blockHeightTo + 1;
      if (this.syncedBlockHeight >= nodeInfo.height)
        this.state = IndexerState.INDEXING;
    }
  }

  // What to do when this fails?
  /////////
  private async getBlocksFromNode(to: number): Promise<BlockByHeight[]> {
    const blocks = await this.client
      .invoke<BlockByHeight[]>(NodeApi.CHAIN_GET_BLOCKS_BY_HEIGHT, {
        from: this.syncedBlockHeight,
        to,
      })
      .catch((err) => {
        this.logger.error('Failed getting blocks');
        throw new Error(err);
      });
    return blocks.reverse();
  }

  // What to do when this fails?
  /////////
  private async getNodeInfo(): Promise<NodeInfo> {
    return this.client
      .invoke<NodeInfo>(NodeApi.SYSTEM_GET_NODE_INFO)
      .catch((err) => {
        this.logger.error('Failed getting node info');
        throw new Error(err);
      });
  }

  private async subscribeToNewBlock() {
    try {
      this.client.subscribe(NodeApi.CHAIN_NEW_BLOCK, async (data: unknown) => {
        const newBlockData = data as NewBlockEvent;
        if (newBlockData.blockHeader.height > this.syncedBlockHeight + 1) {
          this.state = IndexerState.SYNCING;
          this.syncWithNode();
        }
        if (this.state === IndexerState.SYNCING)
          return this.logger.log(
            `Syncing: Current height ${this.syncedBlockHeight}`,
          );
        this.newBlockEvent(newBlockData);
      });
    } catch (err) {
      this.logger.error('Failed to subscribe', err);
      throw new Error(err);
    }
  }

  // Will probably be combined or move to the emitter class not sure
  private newBlockByHeight(blocks: BlockByHeight[]) {
    // this will go the the Event emitter
    for (const block of blocks) {
      this.logger.debug(`New block event for ${block.header.height}`);
    }
  }
  private newBlockEvent(block: NewBlockEvent) {
    // this will go the the Event emitter
    this.logger.debug(`New block event for ${block.blockHeader.height}`);
  }
}
