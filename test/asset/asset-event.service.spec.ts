import { Test, TestingModule } from '@nestjs/testing';
import { AssetService } from '../../src/asset/asset.service';
import { AssetRepoService } from 'src/asset/asset-repo.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaServiceMock, clearDB } from 'test/helpers';

describe('AssetService', () => {
  let service: AssetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetService,
        AssetRepoService,
        {
          provide: PrismaService,
          useValue: new PrismaServiceMock(),
        },
      ],
    }).compile();

    service = module.get<AssetService>(AssetService);

    await clearDB(module.get<PrismaService>(PrismaService));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
