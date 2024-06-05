import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { waitTimeout } from 'src/utils/helpers';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private static hasBeenInitialized = false;

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

  async DEVonlyClearDB() {
    await this.asset.deleteMany({});
    await this.block.deleteMany({});
    await this.nextBlockToSync.deleteMany({});

    // reset autoincrement
    await this.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Asset'`;
    await this.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Block'`;
    await this.$executeRaw`DELETE FROM sqlite_sequence WHERE name='NextBlockToSync'`;
  }
}
