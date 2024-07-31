import { Injectable } from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionRepoService {
  private updateCache: {
    where: Prisma.TransactionWhereUniqueInput;
    data: Prisma.TransactionUpdateInput;
  }[] = [];
  private BATCH_SIZE = 50;

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

  public async updateTransaction(
    transactionWhereUniqueInput: Prisma.TransactionWhereUniqueInput,
    transactionUpdateInput: Prisma.TransactionUpdateInput,
  ): Promise<void> {
    this.updateCache.push({ where: transactionWhereUniqueInput, data: transactionUpdateInput });
    if (this.updateCache.length >= this.BATCH_SIZE) {
      await this.executeBatchUpdate();
    }
  }

  private async executeBatchUpdate(): Promise<void> {
    console.log('Executing batch validator update');
    const updates = this.updateCache.splice(0, this.BATCH_SIZE);

    await this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.transaction.update({
          where: update.where,
          data: update.data,
        }),
      ),
    );
  }

  // public async updateTransaction(
  //   transactionWhereUniqueInput: Prisma.TransactionWhereUniqueInput,
  //   transactionUpdateInput: Prisma.TransactionUpdateInput,
  // ): Promise<Transaction | null> {
  //   return this.prisma.transaction.update({
  //     where: transactionWhereUniqueInput,
  //     data: transactionUpdateInput,
  //   });
  // }
}
