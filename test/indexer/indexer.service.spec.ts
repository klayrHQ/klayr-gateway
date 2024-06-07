import { Test, TestingModule } from '@nestjs/testing';
import { IndexerService, IndexerState } from '../../src/indexer/indexer.service';
import { NodeApiService } from 'src/node-api/node-api.service';
import { waitTimeout } from 'src/utils/helpers';
import { EventService } from 'src/event/event.service';
import { IndexerRepoService } from 'src/indexer/indexer-repo.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaServiceMock, initDB } from 'test/helpers/mock-prisma-service';
import { MockNodeApiService } from 'test/helpers/mock-services';

class MockEventService {
  pushToBlockEventQ = jest.fn();
  pushToTxAndAssetsEventQ = jest.fn();
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

    await initDB(module.get<PrismaService>(PrismaService));
  });

  it('should be defined', () => {
    expect(nodeApiService).toBeDefined();
    expect(indexerService).toBeDefined();
  });

  it('should set syncedBlockHeight and sync and set states on module init', async () => {
    expect(indexerService.state).toBe(IndexerState.SYNCING);
    await indexerService.onApplicationBootstrap();
    expect(indexerService.nextBlockToSync).toBe(1); // genesis is 0 so + 1
    await waitTimeout(1000);
    expect(indexerService.nextBlockToSync).toBe(134); // block number is 133
    expect(eventService.pushToBlockEventQ).toHaveBeenCalledTimes(1);
    expect(indexerService.state).toBe(IndexerState.INDEXING);
  });

  it('should subscribe to new block on module init', async () => {
    await indexerService.onApplicationBootstrap();
    expect(nodeApiService.subscribeToNewBlock).toHaveBeenCalled();
  });
});
