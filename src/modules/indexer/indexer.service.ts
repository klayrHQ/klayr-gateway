import { Injectable } from '@nestjs/common';
import {
  KEY_NEXT_BLOCK_TO_SYNC,
  NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE,
  RETRY_TIMEOUT,
} from 'src/utils/constants';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { Block, NewBlockEvent } from 'src/modules/node-api/types';
import { waitTimeout } from 'src/utils/helpers';
import { StateService } from 'src/modules/state/state.service';
import { IndexerState, Modules } from 'src/modules/state/types';
import { LokiLogger } from 'nestjs-loki-logger';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { EventIndexService } from './event/event-index.service';
import { CommandBus } from '@nestjs/cqrs';
import { CheckForBlockFinalityCommand } from './commands/after-block-event/check-block-finality.command';
import { UpdateBlockGeneratorCommand } from './commands/after-block-event/update-block-generator.command';
import {
  UpdateBlockFee,
  UpdateBlocksFeeCommand,
} from './commands/after-block-event/update-block-fee.command';
import { IndexGenesisBlockCommand } from './commands/startup/genesis-index.command';
import { IndexBlockCommand } from './commands/block-event/block-index.command';
import { IndexTransactionCommand } from './commands/block-event/transaction-index.command';
import { IndexAssetCommand } from './commands/block-event/asset-index.command';
import { ChainEvent } from './interfaces/chain-event.interface';
import { IndexKnownAccountsCommand } from './commands/startup/known-accounts.command';

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
    private readonly nodeApi: NodeApiService,

    private commandBus: CommandBus,
    private chainEventIndexService: EventIndexService,
  ) {
    this.state.set(Modules.INDEXER, IndexerState.START_UP);
  }

  async onModuleInit() {
    await this.nodeApi.getAndSetNodeInfo();
  }

  async onApplicationBootstrap() {
    await this.setNextBlockandState();
    await this.executeStartUpCommands();

    setImmediate(() => {
      this.subscribeToNewBlock().catch((error) => {
        this.logger.error('Error syncing with node', error);
      });
    });
  }

  private async handleNewBlockEvent(blocks: Block[]): Promise<void> {
    this.logger.debug(
      `Block module: New block event ${blocks.at(0).header.height}:${blocks.at(-1).header.height}`,
    );
    try {
      const [chainEvents, eventCountMap] = await this.indexChainEvents(blocks);
      await this.indexBlocks(blocks, eventCountMap);
      const totalBurntPerBlockMap = await this.indexTransactions(blocks);
      await this.writeAndProcessChainEvents(chainEvents);
      await this.indexAssets(blocks);

      await this.executePostIndexCommands(blocks, chainEvents, totalBurntPerBlockMap);

      // TODO: Emit events for modular use
    } catch (error) {
      this.logger.error('Error handling new block event', error);
    }
  }

  private async executeStartUpCommands() {
    if (this.state.get(Modules.INDEXER) === IndexerState.START_UP) {
      await this.commandBus.execute(new IndexGenesisBlockCommand());
      await this.commandBus.execute(new IndexKnownAccountsCommand());
    }
  }

  private async indexChainEvents(blocks: Block[]): Promise<[ChainEvent[], Map<number, number>]> {
    return this.chainEventIndexService.indexChainEvents(blocks);
  }

  private async indexBlocks(blocks: Block[], eventCountMap: Map<number, number>): Promise<void> {
    await this.commandBus.execute(new IndexBlockCommand(blocks, eventCountMap));
  }

  private async indexTransactions(blocks: Block[]): Promise<Map<number, UpdateBlockFee>> {
    return this.commandBus.execute(new IndexTransactionCommand(blocks));
  }

  private async writeAndProcessChainEvents(chainEvents: ChainEvent[]): Promise<void> {
    await this.chainEventIndexService.writeChainEventsToDb(chainEvents);
    await this.chainEventIndexService.processChainEvents(chainEvents);
  }

  private async indexAssets(blocks: Block[]): Promise<void> {
    await this.commandBus.execute(new IndexAssetCommand(blocks));
  }

  private async executePostIndexCommands(
    blocks: Block[],
    chainEvents: any[],
    totalBurntPerBlockMap: Map<number, any>,
  ) {
    await Promise.all([
      this.commandBus.execute(new CheckForBlockFinalityCommand()),
      this.commandBus.execute(new UpdateBlockGeneratorCommand(blocks, chainEvents)),
      this.commandBus.execute(new UpdateBlocksFeeCommand(totalBurntPerBlockMap)),
    ]);
  }

  private async setNextBlockandState() {
    const nextBlockAndState = await this.prisma.nextBlockToSync.findFirst();

    if (nextBlockAndState) {
      this.state.set(Modules.INDEXER, IndexerState.RESTART);
      this.nextBlockToSync = nextBlockAndState.height;
      this.logger.warn(`Gateway restart, continuing sync from block: ${this.nextBlockToSync}`);
      return;
    }

    this.nextBlockToSync = this.nodeApi.nodeInfo.genesisHeight;
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
        this.nodeApi.getAndSetNodeInfo(),
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
      await Promise.all([
        this.handleNewBlockEvent(blocks.reverse()),
        this.nodeApi.cacheNodeApiOnNewBlock(),
        this.updateNextBlockToSync(blocks.at(-1).header.height + 1),
      ]);

      if (this.nextBlockToSync > nodeInfo.height) {
        this.state.set(Modules.INDEXER, IndexerState.INDEXING);
      }
    }
  }

  private async subscribeToNewBlock(): Promise<void> {
    this.nodeApi.subscribeToNewBlock(async (newBlockData: NewBlockEvent) => {
      const newBlockHeight = newBlockData.blockHeader.height;
      const state = this.state.get(Modules.INDEXER);

      if (state === IndexerState.SYNCING)
        return this.logger.log(`Syncing: Current height ${this.nextBlockToSync}`);

      // will go back to syncing state if received block is greather then `nextBlockToSync`
      if (newBlockHeight > this.nextBlockToSync || state === IndexerState.RESTART) {
        this.state.set(Modules.INDEXER, IndexerState.SYNCING);

        setImmediate(() => {
          this.syncWithNode().catch((error) => {
            // this.state.set(Modules.INDEXER, IndexerState.RESTART);
            this.logger.error('Error syncing with node, will retry', error);
          });
        });

        return;
      }

      const block = await this.nodeApi.invokeApi<Block>(NodeApi.CHAIN_GET_BLOCK_BY_ID, {
        id: newBlockData.blockHeader.id,
      });

      await Promise.all([
        this.handleNewBlockEvent([block]),
        this.nodeApi.cacheNodeApiOnNewBlock(),
        this.updateNextBlockToSync(newBlockHeight + 1),
      ]);
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
    const nodeHeight = this.nodeApi.nodeInfo.height;
    const heightToGet = this.nextBlockToSync + NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE;

    return this.nodeApi.invokeApi<Block[]>(NodeApi.CHAIN_GET_BLOCKS_BY_HEIGHT, {
      from: this.nextBlockToSync,
      to: heightToGet > nodeHeight ? nodeHeight : heightToGet,
    });
  }
}
