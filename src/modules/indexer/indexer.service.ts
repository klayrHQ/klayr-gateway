import { Injectable } from '@nestjs/common';
import {
  KEY_NEXT_BLOCK_TO_SYNC,
  NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE,
  RETRY_TIMEOUT,
} from 'src/config/constants';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { Block, NewBlockEvent } from 'src/modules/node-api/types';
import { waitTimeout } from 'src/utils/helpers';
import { StateService } from 'src/modules/state/state.service';
import { IndexerState, Modules } from 'src/modules/state/types';
import { LokiLogger } from 'nestjs-loki-logger';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { EventIndexService } from './event/event-index.service';
import { CommandBus } from '@nestjs/cqrs';
import { CheckForBlockFinalityCommand } from './block/post-block-commands/check-block-finality.command';
import { UpdateBlockGeneratorCommand } from './block/post-block-commands/update-block-generator.command';
import {
  UpdateBlockFee,
  UpdateBlocksFeeCommand,
} from './block/post-block-commands/update-block-fee.command';
import { IndexGenesisBlockCommand } from './startup/genesis-index.command';
import { IndexBlockCommand } from './block/block-commands/block-index.command';
import { IndexTransactionCommand } from './block/block-commands/transaction-index.command';
import { IndexAssetCommand } from './block/block-commands/asset-index.command';
import { ChainEvent } from './interfaces/chain-event.interface';
import { IndexKnownAccountsCommand } from './startup/known-accounts.command';
import { UpdateValidatorRanks } from './event/commands/update-validator-ranks.command';
import { OnEvent } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import { SaveNetworkPeersCommand } from './block/post-block-commands/save-network-peers.command';

// Sets `genesisHeight` as `nextBlockToSync`
// `SYNCING`: Will send new block events to queue from `nextBlockToSync` to current `nodeHeight`
// `INDEXING`: Will subscribe to new block events and send them to queue (INDEXING)
// When received block height > `nextBlockToSync` will go back to `SYNCING`
@Injectable()
export class IndexerService {
  private readonly logger = new LokiLogger(IndexerService.name);
  private processingBlocks: boolean = false;

  public nextBlockToSync: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly state: StateService,
    private readonly nodeApi: NodeApiService,

    private commandBus: CommandBus,
    private eventIndexService: EventIndexService,
  ) {
    this.state.set(Modules.INDEXER, IndexerState.START_UP);
  }

  async onApplicationBootstrap() {
    await this.nodeApi.getAndSetNodeInfo();
    await this.setNextBlockandState();
    setImmediate(() => {
      this.executeStartUpCommands().catch((error) => {
        this.logger.error('Error executing startup commands', error);
      });
    });
  }

  private async executeStartUpCommands() {
    if (this.state.get(Modules.INDEXER) !== IndexerState.START_UP) return;
    await this.commandBus.execute(new IndexGenesisBlockCommand());
    await this.commandBus.execute(new IndexKnownAccountsCommand());
    this.state.set(Modules.INDEXER, IndexerState.STARTED);
  }

  private async executeBlockEventCommands(
    blocks: Block[],
  ): Promise<[ChainEvent[], Map<number, UpdateBlockFee>]> {
    const [chainEvents, eventCountMap] = await this.indexChainEvents(blocks);
    await this.indexBlockHeader(blocks, eventCountMap);
    const totalBurntPerBlockMap = await this.indexTransactions(blocks);
    await this.indexAssets(blocks);

    await this.writeAndProcessChainEvents(chainEvents);

    return [chainEvents, totalBurntPerBlockMap];
  }

  private async executePostBlockCommands(
    blocks: Block[],
    chainEvents: any[],
    totalBurntPerBlockMap: Map<number, any>,
  ) {
    this.logger.debug('Executing post block commands');

    await Promise.all([
      this.commandBus.execute(new SaveNetworkPeersCommand(blocks.at(0).header.height)),
      this.commandBus.execute(new CheckForBlockFinalityCommand()),
    ]);

    await Promise.all([
      this.commandBus.execute(new UpdateBlockGeneratorCommand(blocks, chainEvents)),
      this.commandBus.execute(new UpdateBlocksFeeCommand(totalBurntPerBlockMap)),
    ]);

    if (this.state.get(Modules.INDEXER) === IndexerState.SYNCING) {
      await this.commandBus.execute(new UpdateValidatorRanks());
    }
  }

  public async handleNewBlockEvent(blocks: Block[]): Promise<void> {
    this.logger.debug(
      `Block module: New block event ${blocks.at(0).header.height}:${blocks.at(-1).header.height}`,
    );
    try {
      this.processingBlocks = true;
      const [chainEvents, totalBurntPerBlockMap] = await this.executeBlockEventCommands(blocks);

      await this.executePostBlockCommands(blocks, chainEvents, totalBurntPerBlockMap);

      // TODO: Emit events for modular use
    } catch (error) {
      this.logger.error('Error handling new block event');
      this.logger.error(error.message);
    } finally {
      this.processingBlocks = false;
    }
  }

  private async indexBlockHeader(
    blocks: Block[],
    eventCountMap: Map<number, number>,
  ): Promise<void> {
    await this.commandBus.execute(new IndexBlockCommand(blocks, eventCountMap));
  }

  private async indexTransactions(blocks: Block[]): Promise<Map<number, UpdateBlockFee>> {
    return this.commandBus.execute(new IndexTransactionCommand(blocks));
  }

  private async indexChainEvents(blocks: Block[]): Promise<[ChainEvent[], Map<number, number>]> {
    const [chainEvents, eventCountMap, accounts] =
      await this.eventIndexService.indexChainEvents(blocks);
    await this.eventIndexService.writeAccountsToDb(accounts);
    return [chainEvents, eventCountMap];
  }

  private async writeAndProcessChainEvents(chainEvents: ChainEvent[]): Promise<void> {
    await this.eventIndexService.writeChainEventsToDb(chainEvents);
    await this.eventIndexService.processChainEvents(chainEvents);
  }

  private async indexAssets(blocks: Block[]): Promise<void> {
    await this.commandBus.execute(new IndexAssetCommand(blocks));
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
        this.nodeApi.cacheNodeApiOnNewBlock(blocks.at(-1).header.height),
        this.updateNextBlockToSync(blocks.at(-1).header.height + 1),
      ]);

      if (this.nextBlockToSync > nodeInfo.height) {
        this.state.set(Modules.INDEXER, IndexerState.INDEXING);
      }
    }
  }

  @OnEvent(NodeApi.CHAIN_NEW_BLOCK)
  public async subscribeToNewBlock(newBlockData: NewBlockEvent): Promise<void> {
    const newBlockHeight = newBlockData.blockHeader.height;
    const state = this.state.get(Modules.INDEXER);

    if (this.isStartup(state)) return;
    if (this.isSyncing(state)) return;
    if (this.isProcessingBlocks()) return;

    if (this.shouldSync(newBlockHeight, state)) {
      this.startSyncing();
      return;
    }

    await this.processNewBlock(newBlockData, newBlockHeight);
  }

  private startSyncing(): void {
    this.state.set(Modules.INDEXER, IndexerState.SYNCING);
    setImmediate(() => {
      this.syncWithNode().catch((error) => {
        this.state.set(Modules.INDEXER, IndexerState.RESTART);
        this.logger.error('Error syncing with node, will retry', error);
      });
    });
  }

  private async processNewBlock(
    newBlockData: NewBlockEvent,
    newBlockHeight: number,
  ): Promise<void> {
    const block = await this.nodeApi.invokeApi<Block>(NodeApi.CHAIN_GET_BLOCK_BY_ID, {
      id: newBlockData.blockHeader.id,
    });

    await Promise.all([
      this.handleNewBlockEvent([block]),
      this.nodeApi.cacheNodeApiOnNewBlock(block.header.height),
      this.updateNextBlockToSync(newBlockHeight + 1),
    ]);
  }

  private isStartup(state: IndexerState): boolean {
    if (state === IndexerState.START_UP) {
      this.logger.log('Startup commands running');
      return true;
    }
    return false;
  }

  private isSyncing(state: IndexerState): boolean {
    if (state === IndexerState.SYNCING) {
      this.logger.log(`Syncing: Current height ${this.nextBlockToSync}`);
      return true;
    }
    return false;
  }

  private isProcessingBlocks(): boolean {
    if (this.processingBlocks) {
      this.logger.log(`Already processing blocks: Current height ${this.nextBlockToSync}`);
      return true;
    }
    return false;
  }

  private shouldSync(newBlockHeight: number, state: IndexerState): boolean {
    return newBlockHeight > this.nextBlockToSync || state === IndexerState.RESTART;
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
