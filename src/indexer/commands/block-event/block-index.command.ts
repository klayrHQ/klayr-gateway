import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/prisma/prisma.service';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { RewardAtHeight } from 'src/node-api/types';
import { Block, ProcessedBlockHeader } from '../../interfaces/block.interface';
import { LokiLogger } from 'nestjs-loki-logger';

export class IndexBlockCommand implements ICommand {
  constructor(
    public readonly blocks: Block[],
    public readonly eventCountMap: Map<number, number>,
  ) {}
}

@CommandHandler(IndexBlockCommand)
export class IndexBlockHandler implements ICommandHandler<IndexBlockCommand> {
  private readonly logger = new LokiLogger(IndexBlockHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  async execute(command: IndexBlockCommand): Promise<void> {
    this.logger.debug('Indexing blocks...');

    const processedBlocks = await this.processBlocks(command.blocks, command.eventCountMap);

    await this.prisma.block.createMany({
      data: processedBlocks,
    });
  }

  private async processBlocks(
    blocks: Block[],
    eventCountMap: Map<number, number>,
  ): Promise<ProcessedBlockHeader[]> {
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
        numberOfEvents: eventCountMap.get(block.header.height) || 0,
        aggregateCommit: JSON.stringify(block.header.aggregateCommit),
        totalForged: Number(reward),
      };
    });

    return Promise.all(promises);
  }
}
