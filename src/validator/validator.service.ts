import { Injectable, Logger } from '@nestjs/common';
import { ValidatorRepoService } from './validator.repo-service';
import { AssetTypes, Validator } from 'src/asset/types';
import { Prisma, Validator as PrismaValidator } from '@prisma/client';
import { AccountService } from 'src/account/account.service';
import {
  Block,
  ChainEvent,
  ExpectedValidatorRewards,
  PunishmentPeriod,
  Staker,
  ValidatorInfo,
  ValidatorKeys,
} from 'src/node-api/types';
import { ValidatorRewardMap, ValidatorStakedData, ValidatorStatus } from './types';
import { OnEvent } from '@nestjs/event-emitter';
import { ChainEvents, GatewayEvents } from 'src/event/types';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { getAddressFromKlayr32Address } from 'src/utils/helpers';
import { ACTIVE_VALIDATORS, MINIMUM_VALIDATOR_WEIGHT } from 'src/utils/constants';
import { IndexerState, Modules } from 'src/state/types';
import { StateService } from 'src/state/state.service';
import { BlockRepoService } from 'src/block/block-repo.service';
import { StakeService } from 'src/stake/stake.service';

@Injectable()
export class ValidatorService {
  // TODO: Locking to avoid race conditions. Might change to seperate service if needed
  private lockStore = new Map<string, boolean>();
  private logger = new Logger(ValidatorService.name);
  // TODO: Testing if this solves the validator syncing and stil gives correct ranks
  private isUpdatingValidators = false;

  constructor(
    private readonly state: StateService,
    private readonly validatorRepo: ValidatorRepoService,
    private readonly accountService: AccountService,
    private readonly nodeApi: NodeApiService,
    private readonly blockRepo: BlockRepoService,
    private readonly stakeService: StakeService,
  ) {}

  @OnEvent(GatewayEvents.INDEXER_STATE_CHANGE_INDEXING)
  public async handleStateChange() {
    await this.updateValidatorRanks();
  }

  @OnEvent(GatewayEvents.PROCESS_POS_ASSET)
  public async processPosAsset(validators: Validator[]) {
    this.logger.log('Processing POS asset');
    const accountsInput = validators.map(({ address, name }) => ({
      address,
      name,
    }));

    for (const account of accountsInput) {
      await this.accountService.updateOrCreateAccount(account);
    }

    const validatorsInput: Prisma.ValidatorCreateManyInput[] = validators.map((asset) => ({
      address: asset.address,
      blsKey: asset.blsKey,
      proofOfPossession: asset.proofOfPossession,
      generatorKey: asset.generatorKey,
      lastGeneratedHeight: asset.lastGeneratedHeight,
      isBanned: asset.isBanned,
      reportMisbehaviorHeights: JSON.stringify(asset.reportMisbehaviorHeights),
      consecutiveMissedBlocks: asset.consecutiveMissedBlocks,
      commission: asset.commission,
      lastCommissionIncreaseHeight: asset.lastCommissionIncreaseHeight,
      sharingCoefficients: JSON.stringify(asset.sharingCoefficients),
    }));
    return this.validatorRepo.createValidatorsBulk(validatorsInput);
  }

  @OnEvent(ChainEvents.POS_VALIDATOR_REGISTERED)
  public async processValidatorRegistered(event: ChainEvent) {
    const { address } = JSON.parse(event.data as string);
    await this.processValidatorEvent(address);
  }

  @OnEvent(ChainEvents.POS_COMMISSION_CHANGE)
  public async processCommissionChange(event: ChainEvent) {
    const { validatorAddress } = JSON.parse(event.data as string);
    await this.processValidatorEvent(validatorAddress);
  }

  @OnEvent(ChainEvents.POS_VALIDATOR_STAKED)
  public async processValidatorStaked(event: ChainEvent) {
    const { senderAddress } = JSON.parse(event.data as string) as ValidatorStakedData;
    const stakes = await this.nodeApi.invokeApi<Staker>(NodeApi.POS_GET_STAKER, {
      address: senderAddress,
    });

    for await (const stake of stakes.stakes) {
      await this.handleValidatorEvent(stake.validatorAddress);
    }

    await this.stakeService.addStakesFromStaker(senderAddress);
  }

  @OnEvent(ChainEvents.POS_VALIDATOR_BANNED)
  public async processValidatorBanned(event: ChainEvent) {
    const { address } = JSON.parse(event.data as string);
    await this.handleValidatorEvent(address);
  }

  @OnEvent(ChainEvents.POS_VALIDATOR_PUNISHED)
  public async processValidatorPunished(event: ChainEvent) {
    const { address } = JSON.parse(event.data as string);
    await this.handleValidatorEvent(address);
  }

  private async handleValidatorEvent(address: string) {
    await this.processValidatorEvent(address);

    if (this.state.get(Modules.INDEXER) === IndexerState.INDEXING) {
      await this.updateValidatorRanks();
    }
  }

  private async processValidatorEvent(validatorAddress: string) {
    if (!this.acquireLock(validatorAddress)) return;

    const [validatorInfo, expectedRewards, validatorExists] = await Promise.all([
      this.getValidatorPosInfo(validatorAddress),
      this.getExpectedValidatorRewards(validatorAddress),
      this.validatorRepo.getValidator({ address: validatorAddress }),
    ]);

    if (!validatorExists) {
      await this.createValidator(validatorInfo);
    }

    if (validatorExists) {
      await this.validatorRepo.updateValidator({
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

  public async updateValidatorRanks() {
    this.logger.log('Updating validator ranks');
    if (this.isUpdatingValidators) return this.logger.log('Already updating validators');
    this.isUpdatingValidators = true;

    const validators = await this.validatorRepo.getAllValidators();

    // Sorting validators with the same weight by address(bytes)
    const sortedValidators = this.sortValidators(validators);

    let numberOfActiveValidators = ACTIVE_VALIDATORS;
    for await (const [index, validator] of sortedValidators.entries()) {
      validator.rank = index + 1;
      const validatorStatus = this.calcStatus(validator, numberOfActiveValidators);

      if (this.isBannedOrPunished(validator.status) && validator.rank <= numberOfActiveValidators) {
        numberOfActiveValidators++;
      }
      await this.validatorRepo.updateValidator({
        where: { address: validator.address },
        data: { rank: validator.rank, status: validatorStatus },
      });
    }

    this.isUpdatingValidators = false;
    this.logger.log('Completed updating validator ranks');
  }

  @OnEvent(GatewayEvents.UPDATE_BLOCK_GENERATOR)
  public async updateBlockGeneratorAndTotalRewards({
    blocks,
    chainEvents,
  }: {
    blocks: Block[];
    chainEvents: ChainEvent[];
  }) {
    const validatorData = new Map<string, ValidatorRewardMap>();
    const chainEventsMap = new Map<number, ChainEvent[]>();

    chainEvents.forEach((event) => {
      if (!chainEventsMap.has(event.height)) chainEventsMap.set(event.height, []);
      chainEventsMap.get(event.height)!.push(event);
    });

    blocks.forEach((block) => {
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
    for (const [
      validatorAddress,
      { height, totalRewards, sharedRewards, selfStakeRewards },
    ] of validatorAddresses) {
      const [blockCount, validator] = await Promise.all([
        this.blockRepo.countBlocks({
          where: { generatorAddress: validatorAddress },
        }),
        this.validatorRepo.getValidator({
          address: validatorAddress,
        }),
      ]);

      await this.validatorRepo.updateValidator({
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

  private async getValidatorKeys(address: string): Promise<ValidatorKeys> {
    return this.nodeApi.invokeApi<ValidatorKeys>(NodeApi.VALIDATORS_GET_VALIDATOR, {
      address,
    });
  }

  private async createValidator(val: ValidatorInfo) {
    await this.accountService.updateOrCreateAccount({
      address: val.address,
      name: val.name,
    });

    const keys = await this.getValidatorKeys(val.address);

    await this.validatorRepo.createValidatorsBulk([
      {
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
    ]);
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

  private isBannedOrPunished(status: string): boolean {
    return status === ValidatorStatus.BANNED || status === ValidatorStatus.PUNISHED;
  }

  private createDefaultMap(height: number): ValidatorRewardMap {
    return {
      height,
      totalRewards: BigInt(0),
      sharedRewards: BigInt(0),
      selfStakeRewards: BigInt(0),
    };
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
}
