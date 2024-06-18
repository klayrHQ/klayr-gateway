import { Injectable } from '@nestjs/common';
import { ValidatorRepoService } from './validator.repo-service';
import { Validator } from 'src/asset/types';
import { Prisma } from '@prisma/client';
import { AccountService } from 'src/account/account.service';
import { getKlayer32Address } from 'src/utils/helpers';
import { Transaction } from 'src/node-api/types';
import { RegisterValidatorParams } from './types';
import { OnEvent } from '@nestjs/event-emitter';
import { TxEvents } from 'src/event/types';

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

    await this.accountService.createAccountsBulk(accountsInput);

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

  @OnEvent(TxEvents.POS_REGISTER_VALIDATOR)
  public async processRegisterValidator(registerValidatorTx: Transaction) {
    const { senderPublicKey } = registerValidatorTx;
    const decodedParams = registerValidatorTx.decodedParams as RegisterValidatorParams;

    const senderAddress = getKlayer32Address(senderPublicKey);
    const { name, blsKey, proofOfPossession, generatorKey } = decodedParams;

    await this.accountService.updateOrCreateAccount({
      address: senderAddress,
      name,
    });

    const validatorInput: Prisma.ValidatorCreateManyInput = {
      address: senderAddress,
      blsKey,
      proofOfPossession,
      generatorKey,
    };

    await this.validatorRepoService.createValidatorsBulk([validatorInput]);
  }
}
