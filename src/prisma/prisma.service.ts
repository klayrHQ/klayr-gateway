import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['info'],
    });
  }

  // for DEV, should be fixed later
  async onModuleInit() {
    await this.$connect();

    if (process.env.NODE_ENV === 'dev') {
      this.logger.warn('DEV mode: clearing DB');
      await this.DEVonlyClearDB();
    }
  }

  async DEVonlyClearDB() {
    await this.chainEvents.deleteMany({});
    await this.transaction.deleteMany({});
    await this.asset.deleteMany({});
    await this.block.deleteMany({});
    await this.nextBlockToSync.deleteMany({});
    await this.stake.deleteMany({});
    await this.validator.deleteMany({});
    await this.account.deleteMany({});
  }
}
