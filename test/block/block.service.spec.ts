import { Test, TestingModule } from '@nestjs/testing';
import { BlockEventService } from '../../src/block/block-event.service';
import { Block } from '../../src/node-api/types';
import { testBlock } from 'test/mock-values/node-api-mocks';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockRepoService } from 'src/block/block-repo.service';
import { PrismaServiceMock, clearDB } from 'test/helpers';
import { EventService } from 'src/event/event.service';

class MockEventService {
  pushToAssetsEventQ = jest.fn();
}

describe('BlockEventService', () => {
  let repoService: BlockRepoService;
  let blockEventService: BlockEventService;
  let eventService: EventService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockRepoService,
        BlockEventService,
        {
          provide: PrismaService,
          useValue: new PrismaServiceMock(),
        },
        { provide: EventService, useClass: MockEventService },
      ],
    }).compile();

    repoService = module.get<BlockRepoService>(BlockRepoService);
    blockEventService = module.get<BlockEventService>(BlockEventService);
    eventService = module.get<EventService>(EventService);
    prisma = module.get<PrismaService>(PrismaService);

    await clearDB(prisma);
  });

  it('should be defined', () => {
    expect(blockEventService).toBeDefined();
  });

  it('should create a block and retrieve it from test DB', async () => {
    const block: Block = testBlock;

    await blockEventService.createBlock([block]);
    const createdBlock = await repoService.getBlock({ id: block.header.id });

    expect(eventService.pushToAssetsEventQ).toHaveBeenCalledTimes(1);

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
  });
});
