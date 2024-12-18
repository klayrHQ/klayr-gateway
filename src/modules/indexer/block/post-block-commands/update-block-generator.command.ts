import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Block } from '../../interfaces/block.interface';
import { ChainEvent } from '../../interfaces/chain-event.interface';
import { AssetTypes } from '../../interfaces/asset.interface';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { LokiLogger } from 'nestjs-loki-logger';

export class UpdateBlockGeneratorCommand {
  constructor(
    public readonly blocks: Block[],
    public readonly chainEvents: ChainEvent[],
  ) {}
}

type ValidatorRewardMap = {
  height: number;
  totalRewards: bigint;
  sharedRewards: bigint;
  selfStakeRewards: bigint;
};

@CommandHandler(UpdateBlockGeneratorCommand)
export class UpdateBlockGeneratorHandler implements ICommandHandler<UpdateBlockGeneratorCommand> {
  private logger = new LokiLogger(UpdateBlockGeneratorHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateBlockGeneratorCommand) {
    this.logger.debug('Updating block generator rewards');
    const validatorData = new Map<string, ValidatorRewardMap>();
    const chainEventsMap = new Map<number, ChainEvent[]>();

    command.chainEvents.forEach((event) => {
      if (!chainEventsMap.has(event.height)) chainEventsMap.set(event.height, []);
      chainEventsMap.get(event.height)!.push(event);
    });

    command.blocks.forEach((block) => {
      const { height, generatorAddress } = block.header;
      if (height === 0) return; // Skip genesis block

      const chainEvents = chainEventsMap.get(height) ?? [];
      const reward = this.getRewardFromEvent(chainEvents);
      const lockedAmount = this.getLockedAmountFromEvent(chainEvents, generatorAddress);

      const mapData = validatorData.get(generatorAddress) ?? this.createDefaultMap(height);

      validatorData.set(generatorAddress, {
        height: height,
        totalRewards: mapData.totalRewards + BigInt(reward),
        sharedRewards: mapData.sharedRewards + BigInt(lockedAmount),
        selfStakeRewards: mapData.selfStakeRewards + (BigInt(reward) - BigInt(lockedAmount)),
      });
    });

    await this.updateValidators(validatorData);
  }

  private async updateValidators(validatorAddresses: Map<string, ValidatorRewardMap>) {
    for await (const [
      validatorAddress,
      { height, totalRewards, sharedRewards, selfStakeRewards },
    ] of validatorAddresses) {
      const blockCount = await this.prisma.block.count({
        where: { generatorAddress: validatorAddress },
      });
      let validator = await this.prisma.validator.findUnique({
        where: { address: validatorAddress },
      });

      if (!validator) {
        validator = await this.prisma.validator.create({
          data: {
            address: validatorAddress,
            lastGeneratedHeight: height,
            generatedBlocks: blockCount,
            totalRewards: totalRewards,
            totalSharedRewards: sharedRewards,
            totalSelfStakeRewards: selfStakeRewards,
          },
        });
        continue;
      }

      await this.prisma.validator.update({
        where: { address: validatorAddress },
        data: {
          lastGeneratedHeight: height,
          generatedBlocks: blockCount,
          totalRewards: validator.totalRewards + totalRewards,
          totalSharedRewards: validator.totalSharedRewards + sharedRewards,
          totalSelfStakeRewards: validator.totalSelfStakeRewards + selfStakeRewards,
        },
      });
    }
  }

  private getRewardFromEvent(chainEvents: ChainEvent[]): number {
    const rewardEvent = chainEvents.find(
      (event) =>
        event.name === AssetTypes.REWARD_MINTED && event.module === AssetTypes.DYNAMIC_REWARD,
    );

    return rewardEvent ? JSON.parse(rewardEvent.data as string).amount : 0;
  }

  private getLockedAmountFromEvent(chainEvents: ChainEvent[], validatorAddress: string): number {
    const lockedEvent = chainEvents.find(
      (event) =>
        event.name === AssetTypes.LOCK &&
        event.module === AssetTypes.TOKEN &&
        JSON.parse(event.data as string).module === AssetTypes.POS &&
        JSON.parse(event.data as string).address === validatorAddress,
    );

    return lockedEvent ? JSON.parse(lockedEvent.data as string).amount : 0;
  }

  private createDefaultMap(height: number): ValidatorRewardMap {
    return {
      height,
      totalRewards: BigInt(0),
      sharedRewards: BigInt(0),
      selfStakeRewards: BigInt(0),
    };
  }
}
