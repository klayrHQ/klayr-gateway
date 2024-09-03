import { Injectable, Logger } from '@nestjs/common';
import { NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE, RETRY_TIMEOUT } from 'src/utils/constants';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Block, NewBlockEvent } from 'src/node-api/types';
import { EventService } from 'src/event/event.service';
import { IndexerRepoService } from './indexer-repo.service';
import { BlockEvent, Events, GatewayEvents } from 'src/event/types';
import { waitTimeout } from 'src/utils/helpers';
import { IndexerGenesisService } from './indexer-genesis.service';
import { StateService } from 'src/state/state.service';
import { IndexerState, Modules } from 'src/state/types';
import { IndexerExtraService } from './indexer-extra.service';
import { LokiLogger } from 'nestjs-loki-logger';

// Sets `genesisHeight` as `nextBlockToSync`
// `SYNCING`: Will send new block events to queue from `nextBlockToSync` to current `nodeHeight`
// `INDEXING`: Will subscribe to new block events and send them to queue (INDEXING)
// When received block height > `nextBlockToSync` will go back to `SYNCING`
@Injectable()
export class IndexerService {
  private readonly logger = new LokiLogger(IndexerService.name);
  public nextBlockToSync: number;

  constructor(
    private readonly state: StateService,
    private readonly indexerRepoService: IndexerRepoService,
    private readonly indexerGenesisService: IndexerGenesisService,
    private readonly indexExtraService: IndexerExtraService,
    private readonly nodeApiService: NodeApiService,
    private readonly eventService: EventService,
  ) {
    this.state.set(Modules.INDEXER, IndexerState.START_UP);
  }

  async onModuleInit() {
    await this.nodeApiService.getAndSetNodeInfo();
  }

  async onApplicationBootstrap() {
    await this.setNextBlockandState();

    if (this.state.get(Modules.INDEXER) === IndexerState.START_UP) {
      await this.indexerGenesisService.processGenesisBlock();
      await this.indexExtraService.indexExtraService();
    }

    setImmediate(() => {
      this.subscribeToNewBlock().catch((error) => {
        this.logger.error('Error syncing with node', error);
      });
    });
  }

  private async setNextBlockandState() {
    const nextBlockAndState = await this.indexerRepoService.getNextBlockToSync();

    if (nextBlockAndState) {
      this.state.set(Modules.INDEXER, IndexerState.RESTART);
      this.nextBlockToSync = nextBlockAndState.height;
      this.logger.warn(`Gateway restart, continuing sync from block: ${this.nextBlockToSync}`);
      return;
    }

    this.nextBlockToSync = this.nodeApiService.nodeInfo.genesisHeight;
    await this.indexerRepoService.setNextBlockToSync({
      height: this.nextBlockToSync,
    });
  }

  private async syncWithNode(): Promise<void> {
    while (this.state.get(Modules.INDEXER) === IndexerState.SYNCING) {
      const [blocks, nodeInfo] = await Promise.all([
        this.getBlocks(),
        this.nodeApiService.getAndSetNodeInfo(),
      ]);

      if (!blocks || !nodeInfo || blocks.length === 0) {
        await waitTimeout(RETRY_TIMEOUT);
        continue;
      }

      blocks.forEach((block) => {
        const nodeHeight = nodeInfo.height;
        if (block.header.height <= nodeHeight) block.header.isFinal = true;
      });

      // modifying the blocks array here
      await this.newBlock({ event: Events.NEW_BLOCKS_EVENT, blocks: blocks.reverse() });

      await this.updateNextBlockToSync(blocks.at(-1).header.height + 1);

      if (this.nextBlockToSync > nodeInfo.height) {
        this.state.set(Modules.INDEXER, IndexerState.INDEXING);

        await this.eventService.pushToGeneralEventQ({
          event: GatewayEvents.INDEXER_STATE_CHANGE_INDEXING,
          payload: {},
        });
      }
    }
  }

  private async subscribeToNewBlock(): Promise<void> {
    this.nodeApiService.subscribeToNewBlock(async (newBlockData: NewBlockEvent) => {
      const newBlockHeight = newBlockData.blockHeader.height;
      const state = this.state.get(Modules.INDEXER);

      if (state === IndexerState.SYNCING)
        return this.logger.log(`Syncing: Current height ${this.nextBlockToSync}`);

      // will go back to syncing state if received block is greather then `nextBlockToSync`
      if (newBlockHeight > this.nextBlockToSync || state === IndexerState.RESTART) {
        this.state.set(Modules.INDEXER, IndexerState.SYNCING);

        setImmediate(() => {
          this.syncWithNode().catch((error) => {
            this.state.set(Modules.INDEXER, IndexerState.RESTART);
            this.logger.error('Error syncing with node, will retry', error);
          });
        });

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
    this.nextBlockToSync = (
      await this.indexerRepoService.updateNextBlockToSync({
        height,
      })
    ).height;
  }

  private async newBlock(blockEvent: BlockEvent): Promise<void> {
    await this.eventService.pushToBlockEventQ(blockEvent);
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
