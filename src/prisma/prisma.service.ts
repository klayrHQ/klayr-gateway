import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    // TODO: FOR DEV ONLY //
    await this.DEVonlyClearDB();
  }

  async DEVonlyClearDB() {
    await this.block.deleteMany({});
    await this.aggregateCommit.deleteMany({});
  }
}
