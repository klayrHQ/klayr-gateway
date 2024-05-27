import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { KEY_NEXT_BLOCK_TO_SYNC } from 'src/utils/constants';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private static hasBeenInitialized = false;

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

  async DEVonlyClearDB() {
    await this.nextBlockToSync.deleteMany({});
    await this.block.deleteMany({});
    await this.aggregateCommit.deleteMany({});
  }
}
