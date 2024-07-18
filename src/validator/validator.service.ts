import { Injectable } from '@nestjs/common';
import { ValidatorRepoService } from './validator.repo-service';
import { Validator } from 'src/asset/types';
import { Prisma } from '@prisma/client';
import { AccountService } from 'src/account/account.service';
import { ChainEvent, ValidatorInfo, ValidatorKeys } from 'src/node-api/types';
import { ValidatorStakedData } from './types';
import { OnEvent } from '@nestjs/event-emitter';
import { ChainEvents } from 'src/event/types';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { get } from 'node:http';
import { getKlayr32FromPublic } from 'src/utils/helpers';

@Injectable()
export class ValidatorService {
  // TODO: Locking to avoid race conditions. Might change to seperate service if needed
  private lockStore = new Map<string, boolean>();

  constructor(
    private readonly validatorRepoService: ValidatorRepoService,
    private readonly accountService: AccountService,
    private readonly nodeApiService: NodeApiService,
  ) {}

  // being called by indexer-genesis service
  public async processPosAsset(validators: Validator[]) {
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
    return this.validatorRepoService.createValidatorsBulk(validatorsInput);
  }

  @OnEvent(ChainEvents.POS_VALIDATOR_STAKED)
  public async processValidatorStaked(event: ChainEvent) {
    const { validatorAddress } = JSON.parse(event.data as string) as ValidatorStakedData;
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
          totalStake: validatorInfo.totalStake,
          selfStake: validatorInfo.selfStake,
          validatorWeight: this.calcValidatorWeight(
            validatorInfo.totalStake,
            validatorInfo.selfStake,
          ),
        },
      );
    }
    this.releaseLock(validatorAddress);
  }

  private async getValidatorPosInfo(address: string): Promise<ValidatorInfo> {
    return this.nodeApiService.invokeApi<ValidatorInfo>(NodeApi.POS_GET_VALIDATOR, {
      address,
    });
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
        totalStake: val.totalStake,
        selfStake: val.selfStake,
        validatorWeight: this.calcValidatorWeight(val.totalStake, val.selfStake),
        lastCommissionIncreaseHeight: val.lastCommissionIncreaseHeight,
        commission: val.commission,
        consecutiveMissedBlocks: val.consecutiveMissedBlocks,
        isBanned: val.isBanned,
        lastGeneratedHeight: val.lastGeneratedHeight,
        reportMisbehaviorHeights: JSON.stringify(val.reportMisbehaviorHeights),
        sharingCoefficients: JSON.stringify(val.sharingCoefficients),
        generatorKey: keys.generatorKey,
        blsKey: keys.blsKey,
      },
    ]);
  }

  private calcValidatorWeight(totalStake: string, selfStake: string): string {
    return Number(totalStake) < Number(selfStake) * 10
      ? totalStake
      : (Number(selfStake) * 10).toString();
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
