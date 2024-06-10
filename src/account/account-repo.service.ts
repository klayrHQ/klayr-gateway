import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccountRepoService {
  constructor(private prisma: PrismaService) {}

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
}
