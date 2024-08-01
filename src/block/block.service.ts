import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventService } from 'src/event/event.service';
import { Asset, Block, RewardAtHeight, Transaction } from 'src/node-api/types';
import { BlockRepoService } from './block-repo.service';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Events, GatewayEvents, Payload } from 'src/event/types';
import { UpdateBlockFee } from 'src/transaction/transaction.service';
import { ChainEventService } from 'src/chain-event/chain-event.service';

@Injectable()
export class BlockService {
  private readonly logger = new Logger(BlockService.name);

  constructor(
    private blockRepo: BlockRepoService,
    private eventService: EventService,
    private nodeApiService: NodeApiService,
    private chainEventService: ChainEventService,
  ) {}

  @OnEvent(Events.NEW_BLOCKS_EVENT)
  public async handleNewBlockEvent(payload: Block[]) {
    this.logger.debug(`Block module: New block event ${payload.at(-1).header.height}`);

    const chainEvents = await this.chainEventService.checkUserAccountsAndSaveEvents(payload);

    const blocks = await this.processBlocks(payload);
    await this.blockRepo.createBlocksBulk(blocks);

    const transactions = this.processTransactions(payload);
    if (transactions && transactions.length > 0) {
      await this.eventService.pushToTxAndAssetsEventQ({
        event: Events.NEW_TX_EVENT,
        payload: transactions,
      });
    }

    await this.checkForBlockFinality();
    await this.chainEventService.writeAndEmitChainEvents(chainEvents);
    await this.emitNewBlockEvents(payload);
  }

  @OnEvent(GatewayEvents.UPDATE_BLOCK_FEE)
  public async updateBlocksFee(payload: Map<number, UpdateBlockFee>): Promise<void> {
    for (const [height, { totalBurnt, totalFee }] of payload.entries()) {
      const { reward } = await this.blockRepo.getBlock({ height });
      const networkFee = totalFee - totalBurnt;
      const totalForged = Number(reward) + networkFee + totalBurnt;

      await this.blockRepo.updateBlock({
        where: {
          height: height,
        },
        data: {
          totalBurnt: totalBurnt,
          networkFee: networkFee,
          totalForged: totalForged,
        },
      });
    }
  }

  private async processBlocks(blocks: Block[]): Promise<any[]> {
    const promises = blocks.map(async (block) => {
      const { reward } = await this.nodeApiService.invokeApi<RewardAtHeight>(
        NodeApi.REWARD_GET_DEFAULT_REWARD_AT_HEIGHT,
        { height: block.header.height },
      );

      return {
        ...block.header,
        reward,
        numberOfTransactions: block.transactions.length,
        numberOfAssets: block.assets.length,
        aggregateCommit: JSON.stringify(block.header.aggregateCommit),
        totalForged: Number(reward),
      };
    });

    return Promise.all(promises);
  }

  private processTransactions(blocks: Block[]): Payload<Transaction>[] {
    return blocks
      .filter((block: Block) => block.transactions.length > 0)
      .map((block: Block) => ({
        height: block.header.height,
        data: block.transactions,
      }));
  }

  private processAssets(blocks: Block[]): Payload<Asset>[] {
    return blocks.map((block: Block) => ({
      height: block.header.height,
      data: block.assets,
    }));
  }

  private async checkForBlockFinality() {
    await this.nodeApiService.getAndSetNodeInfo();
    await this.blockRepo.updateManyBlocks({
      where: {
        isFinal: false,
        height: {
          lte: this.nodeApiService.nodeInfo.finalizedHeight,
        },
      },
      data: {
        isFinal: true,
      },
    });
  }

  private async emitNewBlockEvents(blocks: Block[]) {
    await this.eventService.pushToTxAndAssetsEventQ({
      event: Events.NEW_ASSETS_EVENT,
      payload: this.processAssets(blocks),
    });

    // TODO: revisit this. to avoid race conditions we need to wait for validators to be saved in DB first
    setTimeout(async () => {
      await this.eventService.pushToGeneralEventQ({
        event: GatewayEvents.UPDATE_BLOCK_GENERATOR,
        payload: blocks,
      });
    }, 3000);
  }
}
