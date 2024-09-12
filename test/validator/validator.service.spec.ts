import { Test, TestingModule } from '@nestjs/testing';
import { AccountRepoService } from 'src/account/account-repo.service';
import { AccountService } from 'src/account/account.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ValidatorRepoService } from 'src/validator/validator.repo-service';
import { ValidatorService } from 'src/validator/validator.service';
import { PrismaServiceMock, initDB } from 'test/helpers/mock-prisma-service';
import { mockValidator } from 'test/mock-values/node-api-mocks';

describe('ValidatorService', () => {
  let service: ValidatorService;
  let repoService: ValidatorRepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidatorService,
        ValidatorRepoService,
        { provide: AccountService, useClass: AccountService },
        { provide: AccountRepoService, useClass: AccountRepoService },
        {
          provide: PrismaService,
          useValue: new PrismaServiceMock(),
        },
      ],
    }).compile();

    service = module.get<ValidatorService>(ValidatorService);
    repoService = module.get<ValidatorRepoService>(ValidatorRepoService);

    await initDB(module.get<PrismaService>(PrismaService));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process validators in db', async () => {
    await service.processPosAsset([mockValidator]);

    const createdValidator = await repoService.getValidator({ address: mockValidator.address });

    expect(createdValidator.account.address).toBe(mockValidator.address);
    expect(createdValidator.account.name).toBe(mockValidator.name);
    expect(createdValidator.blsKey).toBe(mockValidator.blsKey);
    expect(createdValidator.proofOfPossession).toBe(mockValidator.proofOfPossession);
    expect(createdValidator.generatorKey).toBe(mockValidator.generatorKey);
  });
});
