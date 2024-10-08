import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { NodeApiService } from 'src/modules/node-api/node-api.service';
import { LokiLogger } from 'nestjs-loki-logger';
import { Validator as PrismaValidator } from '@prisma/client';
import { ValidatorStatus } from '../types';
import { ACTIVE_VALIDATORS, MINIMUM_VALIDATOR_WEIGHT } from 'src/utils/constants';
import { getAddressFromKlayr32Address } from 'src/utils/helpers';
import { PunishmentPeriod } from 'src/modules/node-api/types';

export class UpdateValidatorRanks implements ICommand {}

@CommandHandler(UpdateValidatorRanks)
export class UpdateValidatorRanksHandler implements ICommandHandler<UpdateValidatorRanks> {
  private readonly logger = new LokiLogger(UpdateValidatorRanksHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('Updating validator ranks');

    const validators = await this.prisma.validator.findMany({
      orderBy: {
        validatorWeight: 'desc',
      },
    });

    let numberOfActiveValidators = ACTIVE_VALIDATORS;
    for (const validator of validators) {
      const validatorStatus = this.calcStatus(validator, numberOfActiveValidators);
      validator.status = validatorStatus;

      if (this.isBannedOrPunished(validator.status) && validator.rank <= numberOfActiveValidators) {
        numberOfActiveValidators++;
      }
    }

    const sortedValidators = this.sortValidators(validators);

    for (const [index, validator] of sortedValidators.entries()) {
      validator.rank = index + 1;

      await this.prisma.validator.update({
        where: { address: validator.address },
        data: { rank: validator.rank, status: validator.status },
      });
    }

    this.logger.log('Completed updating validator ranks');
  }

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
}
