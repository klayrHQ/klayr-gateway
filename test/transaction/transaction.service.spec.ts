import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionRepoService } from 'src/transaction/transaction-repo.service';
import { PrismaServiceMock } from 'test/helpers';
import { mockTransactions } from 'test/mock-values/node-api-mocks';

describe('TransactionService', () => {
  let repoService: TransactionRepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepoService,
        {
          provide: PrismaService,
          useValue: new PrismaServiceMock(),
        },
      ],
    }).compile();

    repoService = module.get<TransactionRepoService>(TransactionRepoService);
  });

  it('should be defined', () => {
    expect(repoService).toBeDefined();
  });

  it('should create a transaction in DB', async () => {
    const mockTransaction = mockTransactions[0];
    delete mockTransaction.signatures; // TODO: decide on this

    //add block first

    const result = await repoService.createTransactionsBulk([
      { ...mockTransaction, blockHeight: 10 },
    ]);

    console.log(result);

    expect(result).toBeDefined();
    expect(result.count).toBe(1);
  });
});
