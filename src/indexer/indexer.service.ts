import { Injectable } from '@nestjs/common';
import {
  KEY_NEXT_BLOCK_TO_SYNC,
  NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE,
  RETRY_TIMEOUT,
} from 'src/utils/constants';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Block, NewBlockEvent } from 'src/node-api/types';
import { EventService } from 'src/event/event.service';
import { GatewayEvents } from 'src/event/types';
import { waitTimeout } from 'src/utils/helpers';
import { GenesisIndexService } from './genesis/genesis-index.service';
import { StateService } from 'src/state/state.service';
import { IndexerState, Modules } from 'src/state/types';
import { LokiLogger } from 'nestjs-loki-logger';
import { BlockIndexService } from './block/block-index.service';
import { TransactionIndexService } from './transaction/transaction-index.service';
import { IndexExtraService } from './extra/indexer-extra.service';
import { PrismaService } from 'src/prisma/prisma.service';

// Sets `genesisHeight` as `nextBlockToSync`
// `SYNCING`: Will send new block events to queue from `nextBlockToSync` to current `nodeHeight`
// `INDEXING`: Will subscribe to new block events and send them to queue (INDEXING)
// When received block height > `nextBlockToSync` will go back to `SYNCING`
@Injectable()
export class IndexerService {
  private readonly logger = new LokiLogger(IndexerService.name);
  public nextBlockToSync: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly state: StateService,
    private readonly indexerGenesisService: GenesisIndexService,
    private readonly indexExtraService: IndexExtraService,
    private readonly nodeApiService: NodeApiService,
    private readonly eventService: EventService,

    private readonly blockIndexService: BlockIndexService,
    private readonly transactionIndexService: TransactionIndexService,
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
      // ! not needed for refactor
      // await this.indexExtraService.indexExtraService();
    }

    setImmediate(() => {
      this.subscribeToNewBlock().catch((error) => {
        this.logger.error('Error syncing with node', error);
      });
    });
  }

  public async handleNewBlockEvent(blocks: Block[]): Promise<void> {
    this.logger.debug(
      `Block module: New block event ${blocks.at(0).header.height}:${blocks.at(-1).header.height}`,
    );
    try {
      await this.blockIndexService.indexBlocks(blocks);
      await this.transactionIndexService.indexTransactions(blocks);
    } catch (error) {
      this.logger.error('Error handling new block event', error);
    }
  }

  private async setNextBlockandState() {
    const nextBlockAndState = await this.prisma.nextBlockToSync.findFirst();

    if (nextBlockAndState) {
      this.state.set(Modules.INDEXER, IndexerState.RESTART);
      this.nextBlockToSync = nextBlockAndState.height;
      this.logger.warn(`Gateway restart, continuing sync from block: ${this.nextBlockToSync}`);
      return;
    }

    this.nextBlockToSync = this.nodeApiService.nodeInfo.genesisHeight;
    await this.prisma.nextBlockToSync.create({
      data: {
        id: KEY_NEXT_BLOCK_TO_SYNC,
        height: this.nextBlockToSync,
      },
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

      // await this.newBlock({ event: Events.NEW_BLOCKS_EVENT, blocks: blocks.reverse() });
      // modifying the blocks array here
      await this.handleNewBlockEvent(blocks.reverse());

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
            // TODO: Fix restart state, now it goes to restart on prisma errors etc..
            // this.state.set(Modules.INDEXER, IndexerState.RESTART);
            this.logger.error('Error syncing with node, will retry', error);
          });
        });

        return;
      }

      const block = await this.nodeApiService.invokeApi<Block>(NodeApi.CHAIN_GET_BLOCK_BY_ID, {
        id: newBlockData.blockHeader.id,
      });
      // this.newBlock({ event: Events.NEW_BLOCKS_EVENT, blocks: [block] });
      await this.handleNewBlockEvent([block]);

      await this.updateNextBlockToSync(newBlockHeight + 1);
    });
  }

  private async updateNextBlockToSync(height: number): Promise<void> {
    const nextBlockToSync = await this.prisma.nextBlockToSync.update({
      where: { id: KEY_NEXT_BLOCK_TO_SYNC },
      data: { height },
    });
    this.nextBlockToSync = nextBlockToSync.height;
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
