import { Injectable } from '@nestjs/common';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import {
  ExpectedValidatorRewards,
  PunishmentPeriod,
  Staker,
  ValidatorInfo,
  ValidatorKeys,
} from 'src/node-api/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { StateService } from 'src/state/state.service';
import { IndexerState, Modules } from 'src/state/types';
import { LokiLogger } from 'nestjs-loki-logger';
import { getAddressFromKlayr32Address } from 'src/utils/helpers';
import { Validator as PrismaValidator } from '@prisma/client';
import { ValidatorStatus } from './types';
import { ACTIVE_VALIDATORS, MINIMUM_VALIDATOR_WEIGHT } from 'src/utils/constants';

@Injectable()
export class ValidatorEventService {
  private readonly logger = new LokiLogger(ValidatorEventService.name);
  private lockStore = new Map<string, boolean>();
  private isUpdatingValidators = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly state: StateService,
    private readonly nodeApi: NodeApiService,
  ) {}

  public async handleValidatorEvent(address: string) {
    await this.processValidatorEvent(address);

    if (this.state.get(Modules.INDEXER) === IndexerState.INDEXING) {
      await this.updateValidatorRanks();
    }
  }

  public async processValidatorEvent(validatorAddress: string) {
    if (!this.acquireLock(validatorAddress)) return;

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

    this.releaseLock(validatorAddress);
  }

  public async getStakes(address: string) {
    return this.nodeApi.invokeApi<Staker>(NodeApi.POS_GET_STAKER, {
      address: address,
    });
  }

  private async createValidator(val: ValidatorInfo) {
    await this.prisma.account.upsert({
      where: { address: val.address },
      update: { name: val.name },
      create: { address: val.address, name: val.name },
    });

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

  private async updateValidatorRanks() {
    this.logger.log('Updating validator ranks');
    if (this.isUpdatingValidators) return this.logger.log('Already updating validators');
    this.isUpdatingValidators = true;

    // const validators = await this.validatorRepo.getAllValidators();
    const validators = await this.prisma.validator.findMany({
      orderBy: {
        validatorWeight: 'desc',
      },
    });

    // Sorting validators with the same weight by address(bytes)
    const sortedValidators = this.sortValidators(validators);

    let numberOfActiveValidators = ACTIVE_VALIDATORS;
    for await (const [index, validator] of sortedValidators.entries()) {
      validator.rank = index + 1;
      const validatorStatus = this.calcStatus(validator, numberOfActiveValidators);

      if (this.isBannedOrPunished(validator.status) && validator.rank <= numberOfActiveValidators) {
        numberOfActiveValidators++;
      }
      await this.prisma.validator.update({
        where: { address: validator.address },
        data: { rank: validator.rank, status: validatorStatus },
      });
    }

    this.isUpdatingValidators = false;
    this.logger.log('Completed updating validator ranks');
  }

  // TODO: not sure if punishment period is correct. Should maybe iterate through all periods?
  private calcStatus(validator: PrismaValidator, numberOfActiveValidators: number) {
    if (validator.isBanned) return ValidatorStatus.BANNED;
    if (validator.validatorWeight < MINIMUM_VALIDATOR_WEIGHT) return ValidatorStatus.INELIGIBLE;

    const punishmentPeriods = JSON.parse(validator.punishmentPeriods) as PunishmentPeriod[];
    const height = this.nodeApi.nodeInfo.height;
    if (
      punishmentPeriods.length > 0 &&
      punishmentPeriods[0].start <= height &&
      height <= punishmentPeriods[0].end
    ) {
      return ValidatorStatus.PUNISHED;
    }

    if (validator.rank <= numberOfActiveValidators) return ValidatorStatus.ACTIVE;

    return ValidatorStatus.STANDBY;
  }

  private sortValidators(validators: PrismaValidator[]): PrismaValidator[] {
    return validators.sort((validator1, validator2) => {
      if (this.isBannedOrPunished(validator1.status)) validator1.validatorWeight = BigInt(0);
      if (this.isBannedOrPunished(validator2.status)) validator2.validatorWeight = BigInt(0);

      if (validator1.validatorWeight === validator2.validatorWeight) {
        const bytes1 = getAddressFromKlayr32Address(validator1.address);
        const bytes2 = getAddressFromKlayr32Address(validator2.address);
        return bytes2.compare(bytes1);
      }
      return Number(validator2.validatorWeight) - Number(validator1.validatorWeight);
    });
  }

  private isBannedOrPunished(status: string): boolean {
    return status === ValidatorStatus.BANNED || status === ValidatorStatus.PUNISHED;
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

  private acquireLock(key: string): boolean {
    if (this.lockStore.get(key)) return false;

    this.lockStore.set(key, true);
    return true;
  }

  private releaseLock(key: string) {
    this.lockStore.delete(key);
  }
}
