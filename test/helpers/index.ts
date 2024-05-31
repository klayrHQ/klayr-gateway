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
  await prisma.transaction.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.aggregateCommit.deleteMany({});
  await prisma.block.deleteMany({});
  await prisma.nextBlockToSync.deleteMany({});

  // reset autoincrement
  await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Transaction'`;
  await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Asset'`;
  await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='AggregateCommit'`;
  await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Block'`;
  await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='NextBlockToSync'`;
};
