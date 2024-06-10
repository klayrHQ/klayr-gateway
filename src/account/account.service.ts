import { Injectable } from '@nestjs/common';
import { AccountRepoService } from './account-repo.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepoService: AccountRepoService) {}

  public async createAccountsBulk(accounts: Prisma.AccountCreateManyInput[]) {
    return this.accountRepoService.createAccountsBulk(accounts);
  }

  public async upsertAccounts(accountData: Prisma.AccountUpsertArgs) {
    return this.accountRepoService.upsertAccount(accountData);
  }
}
