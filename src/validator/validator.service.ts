import { Injectable } from '@nestjs/common';
import { ValidatorRepoService } from './validator.repo-service';
import { Validator } from 'src/asset/types';
import { Prisma } from '@prisma/client';
import { AccountService } from 'src/account/account.service';
import { getKlayer32Address } from 'src/utils/helpers';
import { Transaction } from 'src/node-api/types';
import { RegisterValidatorParams } from './types';

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

  public async processRegisterValidator(
    registerValidatorTx: Transaction,
    params: RegisterValidatorParams,
  ) {
    const { senderPublicKey } = registerValidatorTx;
    const senderAddress = getKlayer32Address(senderPublicKey);
    const { name, blsKey, proofOfPossession, generatorKey } = params;

    // ! upserting gives prisma problems
    await this.accountService.updateOrCreateAccount({
      address: senderAddress,
      name,
      publicKey: senderPublicKey,
    });

    const validatorInput: Prisma.ValidatorCreateManyInput = {
      address: senderAddress,
      blsKey,
      proofOfPossession,
      generatorKey,
    };

    return this.validatorRepoService.createValidatorsBulk([validatorInput]);
  }
}
