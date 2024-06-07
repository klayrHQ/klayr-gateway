import { PrismaClient } from '@prisma/client';
import { mock } from 'node:test';
import { PrismaService } from 'src/prisma/prisma.service';

export class PrismaServiceMock extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'file:db/dev.db',
        },
      },
    });
  }
}

export const initDB = async (prisma: PrismaService) => {
  await prisma.asset.deleteMany({});
  await prisma.block.deleteMany({});
  await prisma.nextBlockToSync.deleteMany({});
  await prisma.validator.deleteMany({});

  // reset autoincrement
  await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Asset'`;
  await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Validator'`;
  await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Block'`;
  await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='NextBlockToSync'`;

  await mockValidator(prisma);
};

const mockValidator = async (prisma: PrismaService) => {
  await prisma.validator.create({
    data: {
      address: 'klycgxqv3zoj3zyecrtqoug5efup7enn24jn4u3bx',
      name: 'mockValidator',
      blsKey: 'mockBlsKey',
      proofOfPossession: 'mockProofOfPossession',
      generatorKey: 'mockGeneratorKey',
      lastGeneratedHeight: 1,
      isBanned: false,
      reportMisbehaviorHeights: 'mockReportMisbehaviorHeights',
      consecutiveMissedBlocks: 1,
      commission: 1,
      lastCommissionIncreaseHeight: 1,
      sharingCoefficients: 'mockSharingCoefficients',
    },
  });
};

export const mockBlock = async (prisma: PrismaService) => {
  return await prisma.block.create({
    data: {
      height: 133,
      id: 'mockId',
      version: 1,
      timestamp: 4000,
      previousBlockID: 'mockPreviousBlockID',
      stateRoot: 'mockStateRoot',
      assetRoot: 'mockAssetRoot',
      eventRoot: 'mockEventRoot',
      transactionRoot: 'mockTransactionRoot',
      validatorsHash: 'mockValidatorsHash',
      generatorAddress: 'klycgxqv3zoj3zyecrtqoug5efup7enn24jn4u3bx',
      maxHeightPrevoted: 1,
      maxHeightGenerated: 1,
      impliesMaxPrevotes: false,
      signature: 'mockSignature',
      aggregateCommit: 'mockAggregateCommit',
      numberOfTransactions: 1,
      numberOfAssets: 1,
      isFinal: false,
      reward: 'mockReward',
    },
  });
};
