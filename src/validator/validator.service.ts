import { Injectable, Logger } from '@nestjs/common';
import { ValidatorRepoService } from './validator.repo-service';
import { Validator } from 'src/asset/types';
import { Prisma, Validator as PrismaValidator } from '@prisma/client';
import { AccountService } from 'src/account/account.service';
import {
  AllValidators,
  Block,
  ChainEvent,
  PunishmentPeriod,
  ValidatorInfo,
  ValidatorKeys,
} from 'src/node-api/types';
import { GeneratorInfo, ValidatorStakedData, ValidatorStatus } from './types';
import { OnEvent } from '@nestjs/event-emitter';
import { ChainEvents, GatewayEvents } from 'src/event/types';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { IndexerService, IndexerState } from 'src/indexer/indexer.service';
import { getAddressFromKlayr32Address } from 'src/utils/helpers';
import { ACTIVE_VALIDATORS, MINIMUM_VALIDATOR_WEIGHT } from 'src/utils/constants';

@Injectable()
export class ValidatorService {
  // TODO: Locking to avoid race conditions. Might change to seperate service if needed
  private lockStore = new Map<string, boolean>();
  private logger = new Logger(ValidatorService.name);

  constructor(
    private readonly validatorRepoService: ValidatorRepoService,
    private readonly accountService: AccountService,
    private readonly nodeApiService: NodeApiService,
    private readonly indexerService: IndexerService,
  ) {}

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
    await this.validatorRepoService.createValidatorsBulk(validatorsInput);
  }

  @OnEvent(ChainEvents.POS_VALIDATOR_STAKED)
  public async processValidatorStaked(event: ChainEvent) {
    const { validatorAddress } = JSON.parse(event.data as string) as ValidatorStakedData;
    await this.processValidatorEvent(validatorAddress);
  }

  @OnEvent(ChainEvents.POS_VALIDATOR_BANNED)
  public async processValidatorBanned(event: ChainEvent) {
    const { address } = JSON.parse(event.data as string);
    await this.processValidatorEvent(address);
  }

  @OnEvent(ChainEvents.POS_VALIDATOR_PUNISHED)
  public async processValidatorPunished(event: ChainEvent) {
    const { address } = JSON.parse(event.data as string);
    await this.processValidatorEvent(address);
  }

  private async processValidatorEvent(validatorAddress: string) {
    if (!this.acquireLock(validatorAddress)) return;

    const validatorInfo = await this.getValidatorPosInfo(validatorAddress);
    const validatorExists = await this.validatorRepoService.getValidator({
      address: validatorAddress,
    });

    if (!validatorExists) {
      await this.createValidator(validatorInfo);
    }

    if (validatorExists) {
      await this.validatorRepoService.updateValidator(
        { address: validatorAddress },
        {
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
        },
      );
    }

    if (this.indexerService.state === IndexerState.INDEXING) {
      await this.updateValidatorRanks();
    }

    this.releaseLock(validatorAddress);
  }

  @OnEvent(GatewayEvents.INDEXER_STATE_CHANGE_INDEXING)
  public async updateValidatorRanks() {
    this.logger.log('Updating validator ranks');
    const validators = await this.validatorRepoService.getAllValidators();

    // Sorting validators with the same weight by address(bytes)
    const sortedValidators = this.sortValidators(validators);

    let numberOfActiveValidators = ACTIVE_VALIDATORS;
    for await (const [index, validator] of sortedValidators.entries()) {
      validator.rank = index + 1;
      const validatorStatus = this.calcStatus(validator, numberOfActiveValidators);

      if (
        (validatorStatus === ValidatorStatus.BANNED ||
          validatorStatus === ValidatorStatus.PUNISHED) &&
        validator.rank <= numberOfActiveValidators
      ) {
        numberOfActiveValidators++;
      }

      await this.validatorRepoService.updateValidator(
        { address: validator.address },
        { rank: validator.rank, status: validatorStatus },
      );
    }
  }

  @OnEvent(GatewayEvents.UPDATE_BLOCK_GENERATOR)
  public async updateBlockGenerator(blocks: Block[]) {
    const generatorMap = new Map<string, GeneratorInfo>();

    this.populateGeneratorMap(blocks, generatorMap);
    await this.updateValidators(generatorMap);
  }

  private populateGeneratorMap(blocks: Block[], generatorMap: Map<string, GeneratorInfo>) {
    blocks.forEach((block) => {
      const validatorAddress = block.header.generatorAddress;
      if (block.header.height === 0) return; // Skip genesis block

      if (generatorMap.has(validatorAddress)) {
        const entry = generatorMap.get(validatorAddress)!;
        entry.count++;
        entry.lastGeneratedHeight = block.header.height;
      } else {
        generatorMap.set(validatorAddress, {
          count: 1,
          lastGeneratedHeight: block.header.height,
        });
      }
    });
  }

  private async updateValidators(generatorMap: Map<string, GeneratorInfo>) {
    for (const [validatorAddress, { count, lastGeneratedHeight }] of generatorMap.entries()) {
      const validator = await this.validatorRepoService.getValidator({
        address: validatorAddress,
      });
      if (!validator) {
        this.logger.error(`Validator ${validatorAddress} not found when updating generator`);
        continue;
      }

      await this.validatorRepoService.updateValidator(
        { address: validatorAddress },
        {
          lastGeneratedHeight,
          generatedBlocks: validator.generatedBlocks + count,
        },
      );
    }
  }

  // TODO: not sure if punishment period is correct. Should maybe iterate through all periods?
  private calcStatus(validator: PrismaValidator, numberOfActiveValidators: number) {
    if (validator.isBanned) return ValidatorStatus.BANNED;
    if (validator.validatorWeight < MINIMUM_VALIDATOR_WEIGHT) return ValidatorStatus.INELIGIBLE;

    const punishmentPeriods = JSON.parse(validator.punishmentPeriods) as PunishmentPeriod[];
    const height = this.nodeApiService.nodeInfo.height;
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
      if (validator1.validatorWeight === validator2.validatorWeight) {
        const bytes1 = getAddressFromKlayr32Address(validator1.address);
        const bytes2 = getAddressFromKlayr32Address(validator2.address);
        return bytes2.compare(bytes1);
      }
      return Number(validator2.validatorWeight) - Number(validator1.validatorWeight);
    });
  }

  private async getValidatorPosInfo(address: string): Promise<ValidatorInfo> {
    return this.nodeApiService.invokeApi<ValidatorInfo>(NodeApi.POS_GET_VALIDATOR, {
      address,
    });
  }

  private async getValidatorsPosInfo(): Promise<AllValidators> {
    return this.nodeApiService.invokeApi<AllValidators>(NodeApi.POS_GET_ALL_VALIDATORS, {});
  }

  private async getValidatorKeys(address: string): Promise<ValidatorKeys> {
    return this.nodeApiService.invokeApi<ValidatorKeys>(NodeApi.VALIDATORS_GET_VALIDATOR, {
      address,
    });
  }

  private async createValidator(val: ValidatorInfo) {
    await this.accountService.updateOrCreateAccount({
      address: val.address,
      name: val.name,
    });

    const keys = await this.getValidatorKeys(val.address);

    await this.validatorRepoService.createValidatorsBulk([
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
}
