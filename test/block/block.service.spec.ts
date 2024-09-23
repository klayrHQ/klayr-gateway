import { Test, TestingModule } from '@nestjs/testing';
import { BlockService } from '../../src/modules/block/block.service';
import { Block } from '../../src/modules/node-api/types';
import { testBlock } from 'test/mock-values/node-api-mocks';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { BlockRepoService } from 'src/block/block-repo.service';
import { PrismaServiceMock, initDB } from 'test/helpers/mock-prisma-service';
import { EventService } from 'src/event/event.service';
import { NodeApiService } from 'src/modules/node-api/node-api.service';
import { MockNodeApiService } from 'test/helpers/mock-services';
import { ValidatorService } from 'src/validator/validator.service';

class MockEventService {
  pushToTxAndAssetsEventQ = jest.fn();
}

describe('BlockEventService', () => {
  let repoService: BlockRepoService;
  let blockService: BlockService;
  let eventService: EventService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockRepoService,
        BlockService,
        { provide: ValidatorService, useClass: jest.fn() },
        {
          provide: PrismaService,
          useValue: new PrismaServiceMock(),
        },
        { provide: EventService, useClass: MockEventService },
        { provide: NodeApiService, useClass: MockNodeApiService },
      ],
    }).compile();

    repoService = module.get<BlockRepoService>(BlockRepoService);
    blockService = module.get<BlockService>(BlockService);
    eventService = module.get<EventService>(EventService);
    prisma = module.get<PrismaService>(PrismaService);

    await initDB(prisma);
  });

  it('should be defined', () => {
    expect(blockService).toBeDefined();
  });

  it('should create a block and retrieve it from test DB', async () => {
    const block: Block = testBlock;

    await blockService.handleNewBlockEvent([block]);
    const createdBlock = await repoService.getBlock({ id: block.header.id });

    expect(eventService.pushToTxAndAssetsEventQ).toHaveBeenCalledTimes(2);

    expect(createdBlock).toBeDefined();
    expect(createdBlock.id).toBe(block.header.id);
    expect(createdBlock.version).toBe(block.header.version);
    expect(createdBlock.timestamp).toBe(block.header.timestamp);
    expect(createdBlock.height).toBe(block.header.height);
    expect(createdBlock.previousBlockID).toBe(block.header.previousBlockID);
    expect(createdBlock.stateRoot).toBe(block.header.stateRoot);
    expect(createdBlock.assetRoot).toBe(block.header.assetRoot);
    expect(createdBlock.eventRoot).toBe(block.header.eventRoot);
    expect(createdBlock.transactionRoot).toBe(block.header.transactionRoot);
    expect(createdBlock.validatorsHash).toBe(block.header.validatorsHash);
    expect(createdBlock.generatorAddress).toBe(block.header.generatorAddress);
    expect(createdBlock.maxHeightPrevoted).toBe(block.header.maxHeightPrevoted);
    expect(createdBlock.maxHeightGenerated).toBe(block.header.maxHeightGenerated);
    expect(createdBlock.impliesMaxPrevotes).toBe(block.header.impliesMaxPrevotes);
    expect(createdBlock.signature).toBe(block.header.signature);
    expect(createdBlock.reward).toBe('5000000');
    expect(createdBlock.numberOfTransactions).toBe(2);
    expect(createdBlock.numberOfAssets).toBe(1);
    expect(createdBlock.aggregateCommit).toBe(JSON.stringify(block.header.aggregateCommit));
    expect(createdBlock.isFinal).toBe(true);
  });
});
