import { Test, TestingModule } from '@nestjs/testing';
import { BlockEventService } from '../../src/block/block-event.service';
import { Block } from '../../src/node-api/types';
import { PrismaClient } from '@prisma/client';
import { newBlockArrayMock, testBlock } from 'test/mock-values/node-api-mocks';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockRepoService } from 'src/block/block-repo.service';

class PrismaServiceMock extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'file:db/test.db',
        },
      },
    });
  }
}

describe('BlockEventService', () => {
  let repoService: BlockRepoService;
  let eventService: BlockEventService;
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
      ],
    }).compile();

    repoService = module.get<BlockRepoService>(BlockRepoService);
    eventService = module.get<BlockEventService>(BlockEventService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // clean db
  afterAll(async () => {
    await prisma.$executeRaw`DELETE FROM Block`;
    await prisma.$executeRaw`DELETE FROM AggregateCommit`;
  });

  it('should be defined', () => {
    expect(eventService).toBeDefined();
  });

  it('should create a block and retrieve it from test DB', async () => {
    const block: Block = testBlock;

    await eventService.createBlock(block);
    const createdBlock = await repoService.getBlock({ id: block.header.id });

    console.log({ createdBlock });

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
