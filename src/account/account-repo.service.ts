import { Injectable } from '@nestjs/common';
import { Account, Prisma, Validator } from '@prisma/client';
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

  public async createAccount(
    accountData: Prisma.AccountCreateInput,
  ): Promise<Prisma.AccountCreateInput> {
    return this.prisma.account.create({
      data: accountData,
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

  public async updateAccounts(
    accounts: Prisma.AccountUpdateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.account.updateMany(accounts);
  }

  public async searchAccount(
    search: string,
    limit: number,
    offset: number,
  ): Promise<{ name: string; address: string; publicKey: string; validator: Validator }[]> {
    const accounts = await this.prisma.account.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { address: { contains: search } },
          { publicKey: { contains: search } },
        ],
      },
      select: {
        name: true,
        address: true,
        publicKey: true,
        validator: true,
      },
      take: limit,
      skip: offset,
    });

    return accounts;
  }

  public async countAccounts(search: string): Promise<number> {
    const count = await this.prisma.account.count({
      where: {
        OR: [
          { name: { contains: search } },
          { address: { contains: search } },
          { publicKey: { contains: search } },
        ],
      },
    });

    return count;
  }
}
