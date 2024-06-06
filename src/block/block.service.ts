import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventService, Events, Payload } from 'src/event/event.service';
import { Asset, Block, Transaction } from 'src/node-api/types';
import { BlockRepoService } from './block-repo.service';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';

@Injectable()
export class BlockService {
  private readonly logger = new Logger(BlockService.name);

  constructor(
    private blockRepo: BlockRepoService,
    private eventService: EventService,
    private nodeApiService: NodeApiService,
  ) {}

  @OnEvent(Events.NEW_BLOCKS_EVENT)
  async handleNewBlockEvent(payload: Block[]) {
    this.logger.debug(`Block module: New block event ${payload.at(-1).header.height}`);

    await this.blockRepo.createBlocksBulk(await this.processBlocks(payload));
    await this.eventService.pushToTxAndAssetsEventQ({
      event: Events.NEW_ASSETS_EVENT,
      payload: this.processAssets(payload),
    });

    await this.eventService.pushToTxAndAssetsEventQ({
      event: Events.NEW_TX_EVENT,
      payload: this.processTransactions(payload),
    });

    await this.checkForBlockFinality();

    // TODO: emit event events (chain event)
  }

  private async processBlocks(blocks: Block[]): Promise<any[]> {
    const promises = blocks.map(async (block) => {
      const reward = await this.nodeApiService.invokeApi<any>(
        NodeApi.REWARD_GET_DEFAULT_REWARD_AT_HEIGHT,
        { height: block.header.height },
      );

      return {
        ...block.header,
        reward: reward.reward,
        numberOfTransactions: block.transactions.length,
        numberOfAssets: block.assets.length,
        aggregateCommit: JSON.stringify(block.header.aggregateCommit),
      };
    });

    return Promise.all(promises);
  }

  private processTransactions(blocks: Block[]): Payload<Transaction>[] {
    return blocks.map((block: Block) => ({
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
}

// 100k => 35s old code
// 3 jaar => 8m block  => 45min old code
