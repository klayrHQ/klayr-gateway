import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';

import { readFromJson } from './helpers/helpers';
import { setupE2ETests } from './helpers/e2e-beforeAll';

jest.setTimeout(30000);

describe('IndexerService (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let postgresContainer: StartedPostgreSqlContainer;
  let postgresClient: Client;

  beforeAll(async () => {
    const setup = await setupE2ETests();
    app = setup.app;
    prisma = setup.prisma;
    postgresContainer = setup.postgresContainer;
    postgresClient = setup.postgresClient;
  });

  afterAll(async () => {
    await postgresClient.end();
    await postgresContainer.stop();
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {});

  it('should index genesesis block / addresses', async () => {
    const addressesToCheck = [
      'klyzze2ntt8uss26997whdmdaj5vz7uzbszqggs56',
      'klyzxzngaoedk3p85yy89thj8yjqsecfc77hc5mjn',
      'klyzxu2try9cebmmmwk6e3yqk8ohw286t5pks5cb9',
    ];

    for (const address of addressesToCheck) {
      const account = await prisma.account.findUnique({
        where: { address },
      });

      expect(account).toBeDefined();
      expect(account?.address).toBe(address);
    }
  });

  it('should check a random block from newBlockData', async () => {
    const newBlockData = readFromJson('../mocks/data/newBlockData.json');
    const randomBlock = newBlockData[Math.floor(Math.random() * newBlockData.length)];

    const block = await prisma.block.findUnique({
      where: { height: randomBlock.header.height },
    });

    expect(block).toBeDefined();
    expect(block?.height).toBe(randomBlock.header.height);
    expect(block?.version).toBe(randomBlock.header.version);
    expect(block?.timestamp).toBe(randomBlock.header.timestamp);
    expect(block?.previousBlockID).toBe(randomBlock.header.previousBlockID);
    expect(block?.stateRoot).toBe(randomBlock.header.stateRoot);
    expect(block?.assetRoot).toBe(randomBlock.header.assetRoot);
    expect(block?.eventRoot).toBe(randomBlock.header.eventRoot);
    expect(block?.transactionRoot).toBe(randomBlock.header.transactionRoot);
    expect(block?.validatorsHash).toBe(randomBlock.header.validatorsHash);
    expect(block?.generatorAddress).toBe(randomBlock.header.generatorAddress);
    expect(block?.maxHeightPrevoted).toBe(randomBlock.header.maxHeightPrevoted);
    expect(block?.maxHeightGenerated).toBe(randomBlock.header.maxHeightGenerated);
    expect(block?.impliesMaxPrevotes).toBe(randomBlock.header.impliesMaxPrevotes);
    expect(block?.signature).toBe(randomBlock.header.signature);
    expect(block?.id).toBe(randomBlock.header.id);
  });
});
