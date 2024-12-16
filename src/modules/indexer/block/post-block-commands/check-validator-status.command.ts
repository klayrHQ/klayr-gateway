import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LokiLogger } from 'nestjs-loki-logger';
import { BLOCKS_TO_CHECK_BANNED_VALIDATOR } from 'src/config/constants';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { AllValidators } from 'src/modules/node-api/types';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ValidatorStatus } from '../../event/types';

export class CheckValidatorStatusCommand {
  constructor(public readonly blockHeight: number) {}
}

@CommandHandler(CheckValidatorStatusCommand)
export class CheckValidatorStatusHandler implements ICommandHandler<CheckValidatorStatusCommand> {
  private readonly logger = new LokiLogger(CheckValidatorStatusHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  async execute({ blockHeight }: CheckValidatorStatusCommand) {
    if (blockHeight % BLOCKS_TO_CHECK_BANNED_VALIDATOR !== 0) return;
    this.logger.debug('Checking validator status');
    const validators = await this.getAllValidatorsFromNode();
    if (!validators) return;

    await this.updateBannedValidators(validators);

    this.logger.debug('Validator banned status updated successfully');
  }

  async getAllValidatorsFromNode(): Promise<AllValidators> {
    try {
      const validators = await this.nodeApi.invokeApi<AllValidators>(
        NodeApi.POS_GET_ALL_VALIDATORS,
        {},
      );
      return validators;
    } catch (error) {
      this.logger.error('Error: Failed to fetch all validators', error);
    }
  }

  async updateBannedValidators({ validators }: AllValidators): Promise<void> {
    for (const validator of validators) {
      if (validator.isBanned) {
        const data = {
          isBanned: true,
          status: ValidatorStatus.BANNED,
          totalStake: BigInt(validator.totalStake),
          selfStake: BigInt(validator.selfStake),
          lastGeneratedHeight: validator.lastGeneratedHeight,
          reportMisbehaviorHeights: JSON.stringify(validator.reportMisbehaviorHeights),
          consecutiveMissedBlocks: validator.consecutiveMissedBlocks,
          commission: validator.commission,
          lastCommissionIncreaseHeight: validator.lastCommissionIncreaseHeight,
          sharingCoefficients: JSON.stringify(validator.sharingCoefficients),
          punishmentPeriods: JSON.stringify(validator.punishmentPeriods),
        };

        const account = await this.prisma.account.findUnique({
          where: { address: validator.address },
        });

        if (!account) {
          await this.prisma.account.create({
            data: { address: validator.address },
          });
        }

        await this.prisma.validator.upsert({
          where: { address: validator.address },
          update: data,
          create: {
            address: validator.address,
            ...data,
          },
        });
      }
    }
  }
}
