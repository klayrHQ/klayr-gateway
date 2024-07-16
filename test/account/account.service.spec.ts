import { Test, TestingModule } from '@nestjs/testing';
import { AccountRepoService } from '../../src/account/account-repo.service';

describe.skip('AccountService', () => {
  let service: AccountRepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountRepoService],
    }).compile();

    service = module.get<AccountRepoService>(AccountRepoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
