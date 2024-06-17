import { Injectable, Logger } from '@nestjs/common';
import { NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE } from 'src/utils/constants';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Block, NewBlockEvent } from 'src/node-api/types';
import { EventService } from 'src/event/event.service';
import { IndexerRepoService } from './indexer-repo.service';
import { BlockEvent, Events } from 'src/event/types';

export enum IndexerState {
  SYNCING,
  INDEXING,
}

// Sets `genesisHeight` as `nextBlockToSync`
// `SYNCING`: Will send new block events to queue from `nextBlockToSync` to current `nodeHeight`
// `INDEXING`: Will subscribe to new block events and send them to queue (INDEXING)
// When received block height > `nextBlockToSync` will go back to `SYNCING`
@Injectable()
export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);
  public state: IndexerState;
  public nextBlockToSync: number;

  constructor(
    private readonly indexerRepoService: IndexerRepoService,
    private readonly nodeApiService: NodeApiService,
    private readonly eventService: EventService,
  ) {
    this.state = IndexerState.SYNCING;
  }

  async onApplicationBootstrap() {
    await this.setNextBlockToSync();

    // Errors will be unhandled
    setImmediate(() => this.syncWithNode());
    this.subscribeToNewBlock();
  }

  private async setNextBlockToSync() {
    const nextBlockToSyncFromDB = await this.indexerRepoService.getNextBlockToSync();

    if (nextBlockToSyncFromDB) {
      return (this.nextBlockToSync = nextBlockToSyncFromDB.height);
    }

    // Nodeinfo already set during genesis block processing
    this.nextBlockToSync = this.nodeApiService.nodeInfo.genesisHeight;

    await this.indexerRepoService.setNextBlockToSync({ height: this.nextBlockToSync });
  }

  private async syncWithNode(): Promise<void> {
    while (this.state === IndexerState.SYNCING) {
      const [blocks, nodeInfo] = await Promise.all([
        this.getBlocks(),
        this.nodeApiService.getAndSetNodeInfo(),
      ]);

      blocks.forEach((block) => {
        const nodeHeight = nodeInfo.height;
        if (block.header.height <= nodeHeight) block.header.isFinal = true;
      });
      // modifying the blocks array here
      this.newBlock({ event: Events.NEW_BLOCKS_EVENT, blocks: blocks.reverse() });

      await this.updateNextBlockToSync(blocks.at(-1).header.height + 1);

      if (this.nextBlockToSync > nodeInfo.height) this.state = IndexerState.INDEXING;
    }
  }

  private async subscribeToNewBlock(): Promise<void> {
    this.nodeApiService.subscribeToNewBlock(async (newBlockData: NewBlockEvent) => {
      const newBlockHeight = newBlockData.blockHeader.height;
      if (this.state === IndexerState.SYNCING)
        return this.logger.log(`Syncing: Current height ${this.nextBlockToSync}`);

      // will go back to syncing state if received block is greather then `nextBlockToSync`
      if (newBlockHeight > this.nextBlockToSync) {
        this.state = IndexerState.SYNCING;
        // Errors will be unhandled
        setImmediate(() => this.syncWithNode());
        return;
      }

      const block = await this.nodeApiService.invokeApi<Block>(NodeApi.CHAIN_GET_BLOCK_BY_ID, {
        id: newBlockData.blockHeader.id,
      });
      this.newBlock({ event: Events.NEW_BLOCKS_EVENT, blocks: [block] });

      await this.updateNextBlockToSync(newBlockHeight + 1);
    });
  }

  private async updateNextBlockToSync(height: number): Promise<void> {
    this.nextBlockToSync = (await this.indexerRepoService.updateNextBlockToSync({ height })).height;
  }

  private newBlock(blockEvent: BlockEvent): void {
    this.eventService.pushToBlockEventQ(blockEvent);
  }

  private async getBlocks(): Promise<Block[]> {
    const nodeHeight = this.nodeApiService.nodeInfo.height;
    const heightToGet = this.nextBlockToSync + NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE;

    return this.nodeApiService.invokeApi<Block[]>(NodeApi.CHAIN_GET_BLOCKS_BY_HEIGHT, {
      from: this.nextBlockToSync,
      to: heightToGet > nodeHeight ? nodeHeight : heightToGet,
    });
  }
}
