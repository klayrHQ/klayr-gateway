import { Injectable, Logger } from '@nestjs/common';
import { NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE } from 'src/utils/constants';
import { NodeApiService } from 'src/node-api/node-api.service';
import { Block, NewBlockEvent } from 'src/node-api/types';
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

  constructor(
    private readonly nodeApiService: NodeApiService,
    private readonly eventService: EventService,
    private readonly indexerRepoService: IndexerRepoService,
  ) {
    this.state = IndexerState.SYNCING;
  }

  async onModuleInit() {
    // TODO: Check if genesis is different
    // no sig and generator different
    const nextBlockToSync = (await this.nodeApiService.getNodeInfo()).genesisHeight;

    await this.indexerRepoService.setNextBlockToSync({ height: nextBlockToSync });

    // Errors will be unhandled
    setImmediate(() => this.syncWithNode());
    this.subscribeToNewBlock();
  }

  private async syncWithNode(): Promise<void> {
    while (this.state === IndexerState.SYNCING) {
      const nextBlockToSync = (await this.indexerRepoService.getNextBlockToSync()).height;
      const [nodeInfo, blocks] = await Promise.all([
        this.nodeApiService.getNodeInfo(),
        this.nodeApiService.getBlocksFromNode({
          from: nextBlockToSync,
          to: nextBlockToSync + NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE,
        }),
      ]);

      this.newBlock({ event: Events.NEW_BLOCKS_EVENT, blocks: blocks.reverse() });

      const { height } = await this.indexerRepoService.updateNextBlockToSync({
        height: blocks.at(-1).header.height + 1,
      });

      if (height > nodeInfo.height) this.state = IndexerState.INDEXING;
    }
  }

  private async subscribeToNewBlock(): Promise<void> {
    const nextBlockToSync = (await this.indexerRepoService.getNextBlockToSync()).height;

    this.nodeApiService.subscribeToNewBlock(async (newBlockData: NewBlockEvent) => {
      const newBlockHeight = newBlockData.blockHeader.height;
      if (this.state === IndexerState.SYNCING)
        return this.logger.log(`Syncing: Current height ${nextBlockToSync}`);

      // will go back to syncing state if received block is greather then `nextBlockToSync`
      if (newBlockHeight > nextBlockToSync) {
        this.state = IndexerState.SYNCING;
        // Errors will be unhandled
        setImmediate(() => this.syncWithNode());
        return;
      }

      const block = await this.nodeApiService.getBlockById(newBlockData.blockHeader.id);
      this.newBlock({ event: Events.NEW_BLOCKS_EVENT, blocks: [block] });
      // this.nextBlockToSync = newBlockHeight + 1;
      await this.indexerRepoService.updateNextBlockToSync({ height: newBlockHeight + 1 });
    });
  }

  private newBlock(blockEvent: BlockEvent): void {
    this.eventService.pushToBlockEventQ(blockEvent);
  }
}
