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
    where?: Prisma.TransactionWhereInput & {
      sender?: { address?: string };
      recipient?: { address?: string };
      block?: { id?: string };
    };
    orderBy?: Prisma.TransactionOrderByWithRelationInput;
  }): Promise<
    Prisma.TransactionGetPayload<{
      include: {
        sender: true;
        recipient: true;
        block: { select: { id: true; height: true; timestamp: true; isFinal: true } };
      };
    }>[]
  > {
    const { skip, take, cursor, where, orderBy } = params;
    return await this.prisma.transaction.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        sender: true,
        recipient: true,
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

  public async countTransactions(params: {
    where?: Prisma.TransactionWhereInput & {
      sender?: { address?: string };
      block?: { id?: string };
    };
  }): Promise<number> {
    const { where } = params;
    return this.prisma.transaction.count({
      where,
    });
  }

  public async updateTransaction(params: {
    where: Prisma.TransactionWhereUniqueInput;
    data: Prisma.TransactionUpdateInput;
  }): Promise<void> {
    const { where, data } = params;

    await this.prisma.transaction.update({
      where,
      data,
    });
  }

  public async searchTransactions(search: string): Promise<
    Prisma.TransactionGetPayload<{
      include: {
        sender: true;
      };
    }>[]
  > {
    const where: Prisma.TransactionWhereInput = {
      id: { contains: search },
    };

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        sender: true,
      },
    });

    return transactions;
  }
}
