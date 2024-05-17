import { Injectable, Logger } from '@nestjs/common';
import { NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE } from 'src/utils/constants';
import { NodeApiService } from 'src/node-api/node-api.service';
import { BlockByHeight, NewBlockEvent } from 'src/node-api/types';

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
  public readonly logger = new Logger(IndexerService.name);
  public nextBlockToSync: number; // Probably will go to DB?
  public state: IndexerState;

  constructor(private readonly nodeApiService: NodeApiService) {
    this.state = IndexerState.SYNCING;
  }

  async onModuleInit() {
    this.nextBlockToSync = (await this.nodeApiService.getNodeInfo()).genesisHeight;

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

      this.newBlockByHeight(blocks);
      this.nextBlockToSync = blocks.at(-1).header.height + 1;
      if (this.nextBlockToSync > nodeInfo.height) this.state = IndexerState.INDEXING;
    }
  }

  private async subscribeToNewBlock(): Promise<void> {
    this.nodeApiService.subscribeToNewBlock((newBlockData: NewBlockEvent) => {
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
      this.newBlockEvent(newBlockData);
      this.nextBlockToSync = newBlockHeight + 1;
    });
  }

  // These functions will probably be combined and move to the queue class
  private newBlockByHeight(blocks: BlockByHeight[]): void {
    // this will go the the Event queue
    for (const block of blocks) {
      this.logger.debug(`New block event for ${block.header.height}`);
    }
  }
  private newBlockEvent(block: NewBlockEvent): void {
    // this will go the the Event queue
    this.logger.debug(`New block event for ${block.blockHeader.height}`);
  }
}
