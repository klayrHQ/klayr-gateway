import { Test, TestingModule } from '@nestjs/testing';
import { IndexerService, IndexerState } from '../../src/indexer/indexer.service';
import { NodeApiService } from 'src/node-api/node-api.service';
import { newBlockArrayMock, newBlockEventMock } from 'test/mock-values/node-api-mocks';
import { waitTimeout } from 'src/utils/helpers';
import { EventService } from 'src/event/event.service';
import { IndexerRepoService } from 'src/indexer/indexer-repo.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaServiceMock, clearDB } from 'test/helpers';

class MockNodeApiService {
  getNodeInfo = jest.fn().mockResolvedValue({ height: 5, genesisHeight: 0 });
  getBlocksFromNode = jest.fn().mockResolvedValue(newBlockArrayMock);
  subscribeToNewBlock = jest.fn().mockResolvedValue(newBlockEventMock);
}

class MockEventService {
  pushToBlockEventQ = jest.fn();
}

describe('IndexerService', () => {
  let indexerService: IndexerService;
  let nodeApiService: NodeApiService;
  let eventService: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndexerService,
        IndexerRepoService,
        { provide: NodeApiService, useClass: MockNodeApiService },
        { provide: EventService, useClass: MockEventService },
        {
          provide: PrismaService,
          useValue: new PrismaServiceMock(),
        },
      ],
    }).compile();

    indexerService = module.get<IndexerService>(IndexerService);
    nodeApiService = module.get<NodeApiService>(NodeApiService);
    eventService = module.get<EventService>(EventService);

    await clearDB(module.get<PrismaService>(PrismaService));
  });

  it('should be defined', () => {
    expect(nodeApiService).toBeDefined();
    expect(indexerService).toBeDefined();
  });

  it('should set syncedBlockHeight and sync and set states on module init', async () => {
    expect(indexerService.state).toBe(IndexerState.SYNCING);
    await indexerService.onApplicationBootstrap();
    expect(indexerService.nextBlockToSync).toBe(0);
    await waitTimeout(1000);
    expect(indexerService.nextBlockToSync).toBe(6);
    expect(eventService.pushToBlockEventQ).toHaveBeenCalledTimes(1);
    expect(indexerService.state).toBe(IndexerState.INDEXING);
  });

  it('should subscribe to new block on module init', async () => {
    await indexerService.onApplicationBootstrap();
    expect(nodeApiService.subscribeToNewBlock).toHaveBeenCalled();
  });
});
