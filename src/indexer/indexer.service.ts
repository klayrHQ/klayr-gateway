import { Injectable, Logger } from '@nestjs/common';
import { NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE } from 'src/utils/constants';
import { NodeApiService } from 'src/node-api/node-api.service';
import { NewBlockEvent } from 'src/node-api/types';
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
  // public nextBlockToSync: number; // Probably will go to DB?
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
    // TODO: Continue from saved block in DB
    // TODO: Check if genesis is different, it is
    // no sig and generator different
    this.nextBlockToSync = (await this.nodeApiService.getNodeInfo()).genesisHeight;
    await this.indexerRepoService.setNextBlockToSync({ height: this.nextBlockToSync });

    // Errors will be unhandled
    setImmediate(() => this.syncWithNode());
    this.subscribeToNewBlock();
  }

  private async syncWithNode(): Promise<void> {
    while (this.state === IndexerState.SYNCING) {
      const [nodeInfo, blocks] = await Promise.all([
        this.nodeApiService.getNodeInfo(),
        this.nodeApiService.getBlocksFromNode({
          from: this.nextBlockToSync,
          to: this.nextBlockToSync + NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE,
        }),
      ]);

      // modifying the block array here
      this.newBlock({ event: Events.NEW_BLOCKS_EVENT, blocks: blocks.reverse() });

      this.nextBlockToSync = (
        await this.indexerRepoService.updateNextBlockToSync({
          height: blocks.at(-1).header.height + 1,
        })
      ).height;

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

      const block = await this.nodeApiService.getBlockById(newBlockData.blockHeader.id);
      this.newBlock({ event: Events.NEW_BLOCKS_EVENT, blocks: [block] });

      this.nextBlockToSync = (
        await this.indexerRepoService.updateNextBlockToSync({ height: newBlockHeight + 1 })
      ).height;
    });
  }

  private newBlock(blockEvent: BlockEvent): void {
    this.eventService.pushToBlockEventQ(blockEvent);
  }
}
