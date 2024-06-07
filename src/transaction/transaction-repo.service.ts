import { Injectable } from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionRepoService {
  constructor(private prisma: PrismaService) {}

  public async getTransaction(
    transactionWhereUniqueInput: Prisma.TransactionWhereUniqueInput,
  ): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({
      where: transactionWhereUniqueInput,
    });
  }

  public async getTransactions(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TransactionWhereUniqueInput;
    where?: Prisma.TransactionWhereInput;
    orderBy?: Prisma.TransactionOrderByWithRelationInput;
  }): Promise<Transaction[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return await this.prisma.transaction.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        block: { select: { id: true, height: true, timestamp: true, isFinal: true } },
      },
    });
  }

  public async createTransactionsBulk(
    transactions: Prisma.TransactionCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.transaction.createMany({
      data: transactions,
    });
  }
}
