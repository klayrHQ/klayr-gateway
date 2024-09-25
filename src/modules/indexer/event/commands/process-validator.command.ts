// handlers/process-validator.handler.ts
import { CommandBus, CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { PrismaService } from 'src/modules/prisma/prisma.service';
import { StateService } from 'src/modules/state/state.service';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { LokiLogger } from 'nestjs-loki-logger';
import { ValidatorInfo, ExpectedValidatorRewards, ValidatorKeys } from 'src/modules/node-api/types';
import { IndexerState, Modules } from 'src/modules/state/types';
import { Mutex } from 'async-mutex';
import { UpdateValidatorRanks } from './update-validator-ranks.command';

export class ProcessValidatorCommand implements ICommand {
  constructor(public readonly validatorAddress: string) {}
}

const validatorMutex = new Mutex();

@CommandHandler(ProcessValidatorCommand)
export class ProcessValidatorHandler implements ICommandHandler<ProcessValidatorCommand> {
  private readonly logger = new LokiLogger(ProcessValidatorHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly state: StateService,
    private readonly nodeApi: NodeApiService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: ProcessValidatorCommand): Promise<void> {
    const { validatorAddress } = command;
    const release = await validatorMutex.acquire();

    try {
      await this.processValidatorEvent(validatorAddress);

      if (this.state.get(Modules.INDEXER) === IndexerState.INDEXING) {
        await this.commandBus.execute(new UpdateValidatorRanks());
      }
    } catch (error) {
      this.logger.error(error);
    } finally {
      release();
    }
  }

  private async processValidatorEvent(validatorAddress: string) {
    const [validatorInfo, expectedRewards, validatorExists] = await Promise.all([
      this.getValidatorPosInfo(validatorAddress),
      this.getExpectedValidatorRewards(validatorAddress),
      this.prisma.validator.findUnique({
        where: {
          address: validatorAddress,
        },
      }),
    ]);

    if (!validatorExists) {
      await this.createValidator(validatorInfo);
    }

    if (validatorExists) {
      await this.prisma.validator.update({
        where: { address: validatorAddress },
        data: {
          totalStake: BigInt(validatorInfo.totalStake),
          selfStake: BigInt(validatorInfo.selfStake),
          validatorWeight: this.calcValidatorWeight(
            validatorInfo.totalStake,
            validatorInfo.selfStake,
          ),
          isBanned: validatorInfo.isBanned,
          lastCommissionIncreaseHeight: validatorInfo.lastCommissionIncreaseHeight,
          commission: validatorInfo.commission,
          consecutiveMissedBlocks: validatorInfo.consecutiveMissedBlocks,
          reportMisbehaviorHeights: JSON.stringify(validatorInfo.reportMisbehaviorHeights),
          punishmentPeriods: JSON.stringify(validatorInfo.punishmentPeriods),
          blockReward: BigInt(expectedRewards.blockReward),
        },
      });
    }
  }

  private async createValidator(val: ValidatorInfo) {
    await this.upsertAccount(val.address, val.name);

    const keys = await this.getValidatorKeys(val.address);

    await this.prisma.validator.create({
      data: {
        address: val.address,
        totalStake: BigInt(val.totalStake),
        selfStake: BigInt(val.selfStake),
        validatorWeight: this.calcValidatorWeight(val.totalStake, val.selfStake),
        lastCommissionIncreaseHeight: val.lastCommissionIncreaseHeight,
        commission: val.commission,
        consecutiveMissedBlocks: val.consecutiveMissedBlocks,
        isBanned: val.isBanned,
        lastGeneratedHeight: val.lastGeneratedHeight,
        reportMisbehaviorHeights: JSON.stringify(val.reportMisbehaviorHeights),
        punishmentPeriods: JSON.stringify(val.punishmentPeriods),
        sharingCoefficients: JSON.stringify(val.sharingCoefficients),
        generatorKey: keys.generatorKey,
        blsKey: keys.blsKey,
      },
    });
  }

  private async upsertAccount(address: string, name: string) {
    const account = await this.prisma.account.findUnique({
      where: { address },
    });

    if (!account) {
      await this.prisma.account.create({
        data: { address, name },
      });
    } else {
      await this.prisma.account.update({
        where: { address },
        data: { name },
      });
    }
  }

  private async getValidatorKeys(address: string): Promise<ValidatorKeys> {
    return this.nodeApi.invokeApi<ValidatorKeys>(NodeApi.VALIDATORS_GET_VALIDATOR, {
      address,
    });
  }

  private async getValidatorPosInfo(address: string): Promise<ValidatorInfo> {
    return this.nodeApi.invokeApi<ValidatorInfo>(NodeApi.POS_GET_VALIDATOR, {
      address,
    });
  }

  private async getExpectedValidatorRewards(
    validatorAddress: string,
  ): Promise<ExpectedValidatorRewards> {
    return this.nodeApi.invokeApi<ExpectedValidatorRewards>(
      NodeApi.REWARD_GET_EXPECTED_VALIDATOR_REWARDS,
      {
        validatorAddress,
      },
    );
  }

  private calcValidatorWeight(totalStake: string, selfStake: string): bigint {
    const totalStakeBigInt = BigInt(totalStake);
    const selfStakeBigInt = BigInt(selfStake);
    const tenBigInt = BigInt(10);

    return totalStakeBigInt < selfStakeBigInt * tenBigInt
      ? totalStakeBigInt
      : selfStakeBigInt * tenBigInt;
  }
}
