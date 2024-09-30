import { Test, TestingModule } from '@nestjs/testing';
import { PosController } from '../../src/modules/pos/pos.controller';

describe.skip('ValidatorController', () => {
  let controller: PosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PosController],
    }).compile();

    controller = module.get<PosController>(PosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
