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
    const [validatorInfo, expectedRewards] = await Promise.all([
      this.getValidatorPosInfo(validatorAddress),
      this.getExpectedValidatorRewards(validatorAddress),
    ]);

    await this.upsertValidator(validatorInfo, expectedRewards);
  }

  private async upsertValidator(
    validatorInfo: ValidatorInfo,
    expectedRewards: ExpectedValidatorRewards,
  ) {
    await this.upsertAccount(validatorInfo.address, validatorInfo.name);

    const updateData = {
      totalStake: BigInt(validatorInfo.totalStake),
      selfStake: BigInt(validatorInfo.selfStake),
      validatorWeight: this.calcValidatorWeight(validatorInfo.totalStake, validatorInfo.selfStake),
      isBanned: validatorInfo.isBanned,
      lastCommissionIncreaseHeight: validatorInfo.lastCommissionIncreaseHeight,
      commission: validatorInfo.commission,
      consecutiveMissedBlocks: validatorInfo.consecutiveMissedBlocks,
      reportMisbehaviorHeights: JSON.stringify(validatorInfo.reportMisbehaviorHeights),
      punishmentPeriods: JSON.stringify(validatorInfo.punishmentPeriods),
      sharingCoefficients: JSON.stringify(validatorInfo.sharingCoefficients),
      blockReward: BigInt(expectedRewards.blockReward),
    };

    const keys = await this.getValidatorKeys(validatorInfo.address);

    const createData = {
      ...updateData,
      address: validatorInfo.address,
      lastGeneratedHeight: validatorInfo.lastGeneratedHeight,
      generatorKey: keys.generatorKey,
      blsKey: keys.blsKey,
    };

    await this.prisma.validator.upsert({
      where: { address: validatorInfo.address },
      update: updateData,
      create: createData,
    });
  }

  private async upsertAccount(address: string, name: string) {
    await this.prisma.account.upsert({
      where: { address },
      update: { name },
      create: { address, name },
    });
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
