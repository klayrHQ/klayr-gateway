import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccountRepoService {
  constructor(private prisma: PrismaService) {}

  public async getAccount(
    accountWhereUniqueInput: Prisma.AccountWhereUniqueInput,
  ): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: accountWhereUniqueInput,
    });
  }

  public async createAccountsBulk(
    accounts: Prisma.AccountCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.account.createMany({
      data: accounts,
    });
  }

  public async upsertAccount(
    accountData: Prisma.AccountUpsertArgs,
  ): Promise<Prisma.AccountUpdateInput> {
    return this.prisma.account.upsert(accountData);
  }

  public async updateAccount(
    accountData: Prisma.AccountUpdateArgs,
  ): Promise<Prisma.AccountUpdateInput> {
    return this.prisma.account.update(accountData);
  }
}
