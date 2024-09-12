import { Test, TestingModule } from '@nestjs/testing';
import { AssetService } from '../../src/asset/asset.service';
import { AssetRepoService } from 'src/asset/asset-repo.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PrismaServiceMock, initDB, mockBlock } from 'test/helpers/mock-prisma-service';
import { testBlock } from 'test/mock-values/node-api-mocks';
import { Asset, Block } from 'src/modules/node-api/types';
import { Payload } from 'src/event/types';

describe('AssetService', () => {
  let service: AssetService;
  let repoService: AssetRepoService;

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
    repoService = module.get<AssetRepoService>(AssetRepoService);

    await initDB(module.get<PrismaService>(PrismaService));
    await mockBlock(module.get<PrismaService>(PrismaService));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a block and retrieve it from test DB', async () => {
    const block: Block = testBlock;
    const payload: Payload<Asset> = {
      height: block.header.height,
      data: block.assets,
    };

    await service.createAsset([payload]);
    const createdAsset = await repoService.getAsset({ id: 1 });

    expect(createdAsset.id).toBe(1);
    expect(createdAsset.height).toBe(block.header.height);
    expect(createdAsset.module).toBe(block.assets[0].module);
    expect(createdAsset.data).toBe(block.assets[0].data);
  });
});
