import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export class PrismaServiceMock extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'file:db/test.db',
        },
      },
    });
  }
}

export const clearDB = async (prisma: PrismaService) => {
  await prisma.asset.deleteMany({});
  await prisma.aggregateCommit.deleteMany({});
  await prisma.block.deleteMany({});
  await prisma.nextBlockToSync.deleteMany({});
};
