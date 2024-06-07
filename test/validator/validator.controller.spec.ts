import { Test, TestingModule } from '@nestjs/testing';
import { ValidatorController } from '../../src/validator/validator.controller';

describe.skip('ValidatorController', () => {
  let controller: ValidatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValidatorController],
    }).compile();

    controller = module.get<ValidatorController>(ValidatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
