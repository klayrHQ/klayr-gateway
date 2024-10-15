import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { IndexerService } from '../src/modules/indexer/indexer.service';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';
import { execSync } from 'child_process';
import { NodeApiService } from 'src/modules/node-api/node-api.service';
import { MockNodeApiService } from './mocks/node-api.service.mock';
import { waitTimeout } from 'src/utils/helpers';
import { readFromJson } from './helpers/helpers';

jest.setTimeout(30000);

describe('IndexerService (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let indexerService: IndexerService;
  let nodeApiService: NodeApiService;
  let postgresContainer: StartedPostgreSqlContainer;
  let postgresClient: Client;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer('postgres:17-bullseye').start();

    const connectionUri = postgresContainer.getConnectionUri();
    process.env.DATABASE_URL = connectionUri;
    process.env.NODE_ENV = 'dev';

    postgresClient = new Client({ connectionString: connectionUri });
    await postgresClient.connect();

    execSync('npx prisma migrate deploy --preview-feature', { env: process.env, stdio: 'inherit' });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(NodeApiService)
      .useClass(MockNodeApiService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
    indexerService = app.get<IndexerService>(IndexerService);
    nodeApiService = app.get<NodeApiService>(NodeApiService);

    // let the app sync
    await waitTimeout(5_000);

    const blocks = await nodeApiService.invokeApi('block_array', {});
    await indexerService.handleNewBlockEvent(blocks as any);
  });

  afterAll(async () => {
    await postgresClient.end();
    await postgresContainer.stop();
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {});

  it('should genesesis block / addresses', async () => {
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

// import * as fs from 'fs';
// import * as path from 'path';
// writeToJson(filename: string, data: any): void {
//   const filePath = path.join(__dirname, filename);
//   fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
// }
