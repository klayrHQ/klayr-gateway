import { Injectable } from '@nestjs/common';
import { ValidatorRepoService } from './validator.repo-service';
import { Validator } from 'src/asset/types';
import { Prisma } from '@prisma/client';
import { AccountService } from 'src/account/account.service';
import { getKlayer32FromPublic } from 'src/utils/helpers';
import { ChainEvent } from 'src/node-api/types';
import { ValidatorRegisteredData } from './types';
import { OnEvent } from '@nestjs/event-emitter';
import { ChainEvents } from 'src/event/types';

@Injectable()
export class ValidatorService {
  constructor(
    private readonly validatorRepoService: ValidatorRepoService,
    private readonly accountService: AccountService,
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

  @OnEvent(ChainEvents.POS_VALIDATOR_REGISTERED)
  // TODO: this event only gets the name. Get tx or handle other events?
  // TODO: Change back to original solution of handling POS:REGISTER_VALIDATOR
  public async processRegisterValidator(event: ChainEvent) {
    const { address, name } = event.data as ValidatorRegisteredData;

    await this.accountService.updateOrCreateAccount({
      address,
      name,
    });

    await this.validatorRepoService.createValidatorsBulk([{ address }]);
  }
}
