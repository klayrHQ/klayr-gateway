import { Test, TestingModule } from '@nestjs/testing';
import { NodeApiController } from '../../src/modules/node-api/node-api.controller';

describe.skip('NodeApiController', () => {
  let controller: NodeApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NodeApiController],
    }).compile();

    controller = module.get<NodeApiController>(NodeApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
