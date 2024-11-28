import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { LokiLogger } from 'nestjs-loki-logger';
import { CheckValidatorStatusHandler } from 'src/modules/indexer/block/post-block-commands/check-validator-status.command';
import { ValidatorStatus } from 'src/modules/pos/types';
import { AllValidators } from 'src/modules/node-api/types';
import { BLOCKS_TO_CHECK_BANNED_VALIDATOR } from 'src/config/constants';

describe('CheckValidatorStatusHandler', () => {
  let handler: CheckValidatorStatusHandler;
  let prismaService: PrismaService;
  let nodeApiService: NodeApiService;

  beforeEach(async () => {
    const mockValidators: AllValidators = {
      validators: [
        {
          name: 'przemer',
          totalStake: '103150000000000',
          selfStake: '9899000000000',
          lastGeneratedHeight: 397037,
          isBanned: true,
          reportMisbehaviorHeights: [],
          consecutiveMissedBlocks: 2209,
          commission: 9500,
          lastCommissionIncreaseHeight: 68231,
          sharingCoefficients: [
            {
              tokenID: '0200000000000000',
              coefficient: '20c157e32fecfda501718a0f',
            },
          ],
          address: 'klyhf3gtj3wecxaxy7csqb5k8kszugghpscvat5b4',
          punishmentPeriods: [],
        },
        {
          name: 'validator2',
          totalStake: '50000000000000',
          selfStake: '5000000000000',
          lastGeneratedHeight: 300000,
          isBanned: false,
          reportMisbehaviorHeights: [1, 2, 3],
          consecutiveMissedBlocks: 1000,
          commission: 5000,
          lastCommissionIncreaseHeight: 50000,
          sharingCoefficients: [
            {
              tokenID: '0100000000000000',
              coefficient: '10c157e32fecfda501718a0f',
            },
          ],
          address: 'klyhf3gtj3wecxaxy7csqb5k8kszugghpscvat5b5',
          punishmentPeriods: [],
        },
      ],
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckValidatorStatusHandler,
        {
          provide: PrismaService,
          useValue: {
            validator: {
              update: jest.fn(),
            },
          },
        },
        {
          provide: NodeApiService,
          useValue: {
            invokeApi: jest.fn().mockResolvedValue(mockValidators),
          },
        },
        {
          provide: LokiLogger,
          useValue: {
            debug: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CheckValidatorStatusHandler>(CheckValidatorStatusHandler);
    prismaService = module.get<PrismaService>(PrismaService);
    nodeApiService = module.get<NodeApiService>(NodeApiService);
  });

  it('should return early if blockHeight is not a multiple of BLOCKS_TO_CHECK_BANNED_VALIDATOR', async () => {
    await handler.execute({ blockHeight: BLOCKS_TO_CHECK_BANNED_VALIDATOR + 1 });

    expect(nodeApiService.invokeApi).not.toHaveBeenCalled();
    expect(prismaService.validator.update).not.toHaveBeenCalled();
  });

  it('should fetch and update banned validators', async () => {
    await handler.execute({ blockHeight: BLOCKS_TO_CHECK_BANNED_VALIDATOR });

    expect(nodeApiService.invokeApi).toHaveBeenCalledWith(NodeApi.POS_GET_ALL_VALIDATORS, {});
    expect(prismaService.validator.update).toHaveBeenCalledWith({
      where: { address: 'klyhf3gtj3wecxaxy7csqb5k8kszugghpscvat5b4' },
      data: {
        isBanned: true,
        status: ValidatorStatus.BANNED,
        totalStake: BigInt('103150000000000'),
        selfStake: BigInt('9899000000000'),
        lastGeneratedHeight: 397037,
        reportMisbehaviorHeights: JSON.stringify([]),
        consecutiveMissedBlocks: 2209,
        commission: 9500,
        lastCommissionIncreaseHeight: 68231,
        sharingCoefficients: JSON.stringify([
          {
            tokenID: '0200000000000000',
            coefficient: '20c157e32fecfda501718a0f',
          },
        ]),
        punishmentPeriods: JSON.stringify([]),
      },
    });
    expect(prismaService.validator.update).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when fetching validators', async () => {
    jest.spyOn(nodeApiService, 'invokeApi').mockRejectedValue(new Error('API Error'));

    await handler.execute({ blockHeight: BLOCKS_TO_CHECK_BANNED_VALIDATOR });

    expect(nodeApiService.invokeApi).toHaveBeenCalledWith(NodeApi.POS_GET_ALL_VALIDATORS, {});
    expect(prismaService.validator.update).not.toHaveBeenCalled();
  });
});
