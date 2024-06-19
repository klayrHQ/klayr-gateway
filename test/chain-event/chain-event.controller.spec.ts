import { Test, TestingModule } from '@nestjs/testing';
import { ChainEventController } from '../../src/chain-event/chain-event.controller';

describe('ChainEventController', () => {
  let controller: ChainEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChainEventController],
    }).compile();

    controller = module.get<ChainEventController>(ChainEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
