import { Test, TestingModule } from '@nestjs/testing';
import { AssetEventService } from '../../src/asset/asset-event.service';
import { AssetRepoService } from 'src/asset/asset-repo.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaServiceMock, clearDB } from 'test/helpers';

describe('AssetService', () => {
  let service: AssetEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetEventService,
        AssetRepoService,
        {
          provide: PrismaService,
          useValue: new PrismaServiceMock(),
        },
      ],
    }).compile();

    service = module.get<AssetEventService>(AssetEventService);

    await clearDB(module.get<PrismaService>(PrismaService));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
