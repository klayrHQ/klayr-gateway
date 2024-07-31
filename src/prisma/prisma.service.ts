import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import * as fastq from 'fastq';
import type { queueAsPromised } from 'fastq';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private static hasBeenInitialized = false;
  private dbQ: queueAsPromised<any>;

  constructor() {
    super();
    this.dbWorker = this.dbWorker.bind(this);
    this.dbQ = fastq.promise(this.dbWorker, 1);
  }

  // for DEV, should be fixed later
  async onModuleInit() {
    if (PrismaService.hasBeenInitialized) {
      return;
    }
    await this.$connect();

    if (process.env.NODE_ENV === 'dev') {
      this.logger.warn('DEV mode: clearing DB');
      await this.DEVonlyClearDB();
    }

    PrismaService.hasBeenInitialized = true;
  }

  async pushToDbQ(args: any) {
    this.dbQ.push(args).catch((err) => this.logger.error(err));
  }

  async dbWorker(args: { method: string; params: any[] }): Promise<void> {
    const { method, params } = args;
    if (typeof this[method] === 'function') {
      return await this[method](...params);
    } else {
      throw new Error(`Method ${method} not found on PrismaService`);
    }
  }

  public async executeUpdateValidator(
    validatorWhereUniqueInput: Prisma.ValidatorWhereUniqueInput,
    validatorUpdateInput: Prisma.ValidatorUpdateInput,
  ): Promise<void> {
    await this.validator.update({
      where: validatorWhereUniqueInput,
      data: validatorUpdateInput,
    });
  }

  public async executeCreateValidatorsBulk(
    validators: Prisma.ValidatorCreateManyInput[],
  ): Promise<void> {
    await this.validator.createMany({
      data: validators,
    });
  }

  public async executeUpdateTransaction(
    transactionWhereUniqueInput: Prisma.TransactionWhereUniqueInput,
    transactionUpdateInput: Prisma.TransactionUpdateInput,
  ): Promise<void> {
    await this.transaction.update({
      where: transactionWhereUniqueInput,
      data: transactionUpdateInput,
    });
  }

  async DEVonlyClearDB() {
    await this.chainEvents.deleteMany({});
    await this.transaction.deleteMany({});
    await this.asset.deleteMany({});
    await this.block.deleteMany({});
    await this.nextBlockToSync.deleteMany({});
    await this.validator.deleteMany({});
    await this.account.deleteMany({});

    // reset autoincrement
    await this.$executeRaw`DELETE FROM sqlite_sequence WHERE name='ChainEvents'`;
    await this.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Transaction'`;
    await this.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Asset'`;
    await this.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Validator'`;
    await this.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Account'`;
    await this.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Block'`;
    await this.$executeRaw`DELETE FROM sqlite_sequence WHERE name='NextBlockToSync'`;
  }
}
