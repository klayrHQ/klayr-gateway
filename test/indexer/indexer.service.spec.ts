import { Test, TestingModule } from '@nestjs/testing';
import { IndexerService, IndexerState } from '../../src/indexer/indexer.service';
import { NodeApiService } from 'src/node-api/node-api.service';
import { newBlockArrayMock, newBlockEventMock } from 'test/mock-values/node-api-mocks';
import { waitTimeout } from 'src/utils/helpers';

class MockNodeApiService {
  getNodeInfo = jest.fn().mockResolvedValue({ height: 5, genesisHeight: 0 });
  getBlocksFromNode = jest.fn().mockResolvedValue(newBlockArrayMock);
  subscribeToNewBlock = jest.fn().mockResolvedValue(newBlockEventMock);
}

describe('IndexerService', () => {
  let indexerService: IndexerService;
  let nodeApiService: NodeApiService;
  let debugSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndexerService, { provide: NodeApiService, useClass: MockNodeApiService }],
    }).compile();

    indexerService = module.get<IndexerService>(IndexerService);
    nodeApiService = module.get<NodeApiService>(NodeApiService);
    debugSpy = jest.spyOn(indexerService.logger, 'debug').mockImplementation();
  });

  it('should be defined', () => {
    expect(nodeApiService).toBeDefined();
    expect(indexerService).toBeDefined();
  });

  it('should set syncedBlockHeight to genesisHeight on module init', async () => {
    await indexerService.onModuleInit();
    expect(indexerService.nextBlockToSync).toBe(0);
  });

  it('should sync and set states on module init', async () => {
    expect(indexerService.state).toBe(IndexerState.SYNCING);
    await indexerService.onModuleInit();
    await waitTimeout(1000);
    expect(indexerService.nextBlockToSync).toBe(6);
    expect(debugSpy).toHaveBeenCalledTimes(6);
    expect(indexerService.state).toBe(IndexerState.INDEXING);
  });

  it('should subscribe to new block on module init', async () => {
    await indexerService.onModuleInit();
    expect(nodeApiService.subscribeToNewBlock).toHaveBeenCalled();
  });
});
