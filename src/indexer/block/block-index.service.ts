import { Injectable } from '@nestjs/common';
import { Block, ProcessedBlockHeader } from '../interfaces/block.interface';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { RewardAtHeight } from 'src/node-api/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { LokiLogger } from 'nestjs-loki-logger';

@Injectable()
export class BlockIndexService {
  private readonly logger = new LokiLogger(BlockIndexService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  public async indexBlocks(blocks: Block[]): Promise<void> {
    this.logger.debug('Indexing blocks...');

    const processedBlocks = await this.processBlocks(blocks);
    await this.prisma.block.createMany({
      data: processedBlocks,
    });
  }

  private async processBlocks(
    blocks: Block[],
    // chainEvents: ChainEvent[],
  ): Promise<ProcessedBlockHeader[]> {
    // ! for event-index module
    // const eventCountMap = this.createEventCountMap(chainEvents);

    const promises = blocks.map(async (block) => {
      const { reward } = await this.nodeApi.invokeApi<RewardAtHeight>(
        NodeApi.REWARD_GET_DEFAULT_REWARD_AT_HEIGHT,
        { height: block.header.height },
      );

      return {
        ...block.header,
        reward,
        numberOfTransactions: block.transactions.length,
        numberOfAssets: block.assets.length,
        numberOfEvents: 0,
        // ! for event-index module
        // numberOfEvents: eventCountMap.get(block.header.height) || 0,
        aggregateCommit: JSON.stringify(block.header.aggregateCommit),
        totalForged: Number(reward),
      };
    });

    return Promise.all(promises);
  }
}
