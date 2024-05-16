import { Test, TestingModule } from '@nestjs/testing';
import {
  IndexerService,
  IndexerState,
} from '../../src/indexer/indexer.service';
import { timeout } from 'src/utils/helpers';

describe('IndexerService', () => {
  let service: IndexerService;
  let debugSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndexerService],
    }).compile();

    service = module.get<IndexerService>(IndexerService);
    debugSpy = jest.spyOn(service.logger, 'debug').mockImplementation();
  });

  afterEach(() => {
    // Clean up the spy
    debugSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect with node and sync', async () => {
    await service.onModuleInit();
    await timeout(15000);

    const { height } = await service.getNodeInfo();
    expect(height).toBeGreaterThan(1);

    expect(debugSpy).toHaveBeenCalledTimes(service.syncedBlockHeight);
  }, 20000);
});
