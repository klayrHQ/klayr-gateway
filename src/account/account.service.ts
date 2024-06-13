import { Injectable } from '@nestjs/common';
import { AccountRepoService } from './account-repo.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepoService: AccountRepoService) {}

  public async getAccount(accountWhereUniqueInput: Prisma.AccountWhereUniqueInput) {
    return this.accountRepoService.getAccount(accountWhereUniqueInput);
  }

  public async createAccountsBulk(accounts: Prisma.AccountCreateManyInput[]) {
    return this.accountRepoService.createAccountsBulk(accounts);
  }

  public async upsertAccount(accountData: Prisma.AccountUpsertArgs) {
    return this.accountRepoService.upsertAccount(accountData);
  }

  public async updateAccount(accountData: Prisma.AccountUpdateArgs) {
    return this.accountRepoService.updateAccount(accountData);
  }
}
