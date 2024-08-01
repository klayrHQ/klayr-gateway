import { Injectable } from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StateService } from 'src/state/state.service';
import { IndexerState, Modules } from 'src/state/types';
import { CacheService } from 'src/utils/cache-service';
import { TX_UPDATE_CACHE } from 'src/utils/constants';

@Injectable()
export class TransactionRepoService {
  public updateCache: CacheService<{
    where: Prisma.TransactionWhereUniqueInput;
    data: Prisma.TransactionUpdateInput;
  }>;

  constructor(
    private state: StateService,
    private prisma: PrismaService,
  ) {
    this.updateCache = new CacheService(TX_UPDATE_CACHE, this.executeBatchUpdate.bind(this));
  }

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
    if (this.state.get(Modules.INDEXER) === IndexerState.INDEXING) {
      this.prisma.transaction.update({
        where: transactionWhereUniqueInput,
        data: transactionUpdateInput,
      });
    } else {
      await this.updateCache.add({
        where: transactionWhereUniqueInput,
        data: transactionUpdateInput,
      });
    }
  }

  private async executeBatchUpdate(
    updates: { where: Prisma.TransactionWhereUniqueInput; data: Prisma.TransactionUpdateInput }[],
  ): Promise<void> {
    await this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.transaction.update({
          where: update.where,
          data: update.data,
        }),
      ),
    );
  }
}
