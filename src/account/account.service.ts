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

  public async updateOrCreateAccount(params: {
    address: string;
    name?: string;
    publicKey?: string;
  }) {
    const { address, name, publicKey } = params;
    const updateResult = await this.accountRepoService.updateAccounts({
      where: { address },
      data: { publicKey, name },
    });

    if (updateResult.count === 0) {
      await this.createAccountsBulk([{ address, name, publicKey }]);
    }
  }
}
