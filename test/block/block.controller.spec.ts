import { Test, TestingModule } from '@nestjs/testing';
import { BlockController } from '../../src/block/block.controller';
import { BlockRepoService } from 'src/block/block-repo.service';

describe('BlockController', () => {
  let controller: BlockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockController],
      providers: [
        {
          provide: BlockRepoService,
          useValue: {
            getBlock: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<BlockController>(BlockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
