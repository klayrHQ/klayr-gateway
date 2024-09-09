import { Injectable } from '@nestjs/common';
import { AccountRepoService } from './account-repo.service';
import { Prisma } from '@prisma/client';
import { Staker } from 'src/node-api/types';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepoService: AccountRepoService) {}

  public async getAccount(accountWhereUniqueInput: Prisma.AccountWhereUniqueInput) {
    return this.accountRepoService.getAccount(accountWhereUniqueInput);
  }

  public async createAccountsBulk(accounts: Prisma.AccountCreateManyInput[]) {
    return this.accountRepoService.createAccountsBulk(accounts);
  }

  public async updateAccount(accountData: Prisma.AccountUpdateArgs) {
    return this.accountRepoService.updateAccount(accountData);
  }

  public async updateOrCreateAccount(params: {
    address: string;
    nonce?: string;
    name?: string;
    publicKey?: string;
  }) {
    const { address, nonce, name, publicKey } = params;

    await this.accountRepoService.upsertAccount({
      where: { address },
      update: { publicKey, name, nonce },
      create: { address, publicKey, name, nonce },
    });
  }
}
