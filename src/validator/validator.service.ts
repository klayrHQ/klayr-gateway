import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ValidatorRepoService } from './validator.repo-service';
import { Validator } from 'src/asset/types';
import { Prisma } from '@prisma/client';
import { AccountService } from 'src/account/account.service';
import { getKlayer32Address } from 'src/utils/helpers';

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

  // TODO: types
  public async processRegisterValidator(registerValidatorTx: any, params: any) {
    const { senderPublicKey } = registerValidatorTx;
    const senderAddress = getKlayer32Address(senderPublicKey);
    const { name, blsKey, proofOfPossession, generatorKey } = params;

    // ! Upserting gives problems.
    // TODO: Can be more optimized and pretty same in tx service
    const account = await this.accountService.getAccount({ address: senderAddress });
    if (!account) {
      await this.accountService.createAccountsBulk([
        { address: senderAddress, name, publicKey: senderPublicKey },
      ]);
    } else {
      await this.accountService.updateAccount({
        where: { address: senderAddress },
        data: { publicKey: senderPublicKey, name },
      });
    }

    const validatorInput: Prisma.ValidatorCreateManyInput = {
      address: senderAddress,
      blsKey,
      proofOfPossession,
      generatorKey,
    };

    return this.validatorRepoService.createValidatorsBulk([validatorInput]);
  }
}
