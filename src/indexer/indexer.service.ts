import { Injectable, Logger } from '@nestjs/common';
import { NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE } from 'src/utils/constants';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Block, NewBlockEvent, NodeInfo } from 'src/node-api/types';
import { BlockEvent, EventService, Events } from 'src/event/event.service';
import { IndexerRepoService } from './indexer-repo.service';

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
    // TODO: Check if genesis is different, it is
    // no sig and generator different
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

    this.nextBlockToSync = (
      await this.nodeApiService.invokeApi<NodeInfo>(NodeApi.SYSTEM_GET_NODE_INFO, {})
    ).genesisHeight;
    await this.indexerRepoService.setNextBlockToSync({ height: this.nextBlockToSync });
  }

  private async syncWithNode(): Promise<void> {
    while (this.state === IndexerState.SYNCING) {
      const [nodeInfo, blocks] = await this.getNodeInfoAndBlocks();

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
        return this.logger.log(`Syncing: Current height ${this.nextBlockToSync - 1}`);

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

  public async getNodeInfoAndBlocks(): Promise<[NodeInfo, Block[]]> {
    return Promise.all([
      this.nodeApiService.invokeApi<NodeInfo>(NodeApi.SYSTEM_GET_NODE_INFO, {}),
      this.nodeApiService.invokeApi<Block[]>(NodeApi.CHAIN_GET_BLOCKS_BY_HEIGHT, {
        from: this.nextBlockToSync,
        to: this.nextBlockToSync + NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE,
      }),
    ]);
  }
}
