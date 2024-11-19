import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { IndexerService } from '../../src/modules/indexer/indexer.service';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';
import { execSync } from 'child_process';
import { NodeApiService } from '../../src/modules/node-api/node-api.service';
import { MockNodeApiService } from '../mocks/node-api.service.mock';
import { waitTimeout } from '../../src/utils/helpers';
import { WebSocketClientService } from '../../src/modules/node-api/websocket/websocket.service';
import { MockWebsocketClientService } from '../mocks/websocket.service.mock';

export async function setupE2ETests() {
  const postgresContainer: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    'postgres:17-bullseye',
  ).start();

  const connectionUri = postgresContainer.getConnectionUri();
  process.env.DATABASE_URL = connectionUri;
  process.env.INDEX_KNOWN_ACCOUNTS = 'false';
  process.env.NODE_URL = 'http://localhost:8545';
  process.env.APP_REGISTRY_BRANCH = 'main';
  process.env.KLAYR_ENV = 'testnet';

  const postgresClient = new Client({ connectionString: connectionUri });
  await postgresClient.connect();

  execSync('npx prisma migrate deploy --preview-feature', { env: process.env, stdio: 'inherit' });

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(NodeApiService)
    .useClass(MockNodeApiService)
    .overrideProvider(WebSocketClientService)
    .useClass(MockWebsocketClientService)
    .compile();

  const app: INestApplication = moduleFixture.createNestApplication();
  await app.init();

  const prisma = app.get<PrismaService>(PrismaService);
  const indexerService = app.get<IndexerService>(IndexerService);
  const nodeApiService = app.get<NodeApiService>(NodeApiService);

  // let the app sync / indexing mock blocks
  await waitTimeout(5_000);

  const blocks = await nodeApiService.invokeApi('block_array', {});
  await indexerService.handleNewBlockEvent(blocks as any);

  return { app, prisma, indexerService, nodeApiService, postgresContainer, postgresClient };
}
