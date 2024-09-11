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
import { GenesisIndexService } from './startup/genesis-index.service';
import { StateService } from 'src/state/state.service';
import { IndexerState, Modules } from 'src/state/types';
import { LokiLogger } from 'nestjs-loki-logger';
import { BlockIndexService } from './block/block-index.service';
import { TransactionIndexService } from './block/transaction-index.service';
import { IndexExtraService } from './startup/indexer-extra.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChainEventIndexService } from './chain-event/chain-event-index.service';
import { AssetIndexService } from './block/asset-index.service';
import { CommandBus } from '@nestjs/cqrs';
import { CheckForBlockFinalityCommand } from './after-block/check-block-finality.command';
import { UpdateBlockGeneratorCommand } from './after-block/update-block-generator.command';
import { UpdateBlocksFeeCommand } from './after-block/update-block-fee.command';

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

    private commandBus: CommandBus,

    private blockIndexService: BlockIndexService,
    private transactionIndexService: TransactionIndexService,
    private chainEventIndexService: ChainEventIndexService,
    private assetIndexService: AssetIndexService,
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
      // TODO: move index logic to CQRS pattern?
      const chainEvents = await this.chainEventIndexService.indexChainEvents(blocks);
      const eventCountMap = this.chainEventIndexService.createEventCountMap(chainEvents);

      await this.blockIndexService.indexBlocks(blocks, eventCountMap);
      const totalBurntPerBlockMap = await this.transactionIndexService.indexTransactions(blocks);
      await this.chainEventIndexService.writeChainEventsToDb(chainEvents);
      await this.chainEventIndexService.processChainEvents(chainEvents);
      await this.assetIndexService.indexAssets(blocks);

      // after block index
      await Promise.all([
        this.commandBus.execute(new CheckForBlockFinalityCommand()),
        this.commandBus.execute(new UpdateBlockGeneratorCommand(blocks, chainEvents)),
        this.commandBus.execute(new UpdateBlocksFeeCommand(totalBurntPerBlockMap)),
      ]);

      // TODO: Emit events for modular use
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
