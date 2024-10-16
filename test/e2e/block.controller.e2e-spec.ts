import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';
import { setupE2ETests } from 'test/helpers/e2e-beforeAll';

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

  it('should fetch blocks without any query parameters', async () => {
    const response = await request(app.getHttpServer()).get('/blocks').expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should fetch blocks with blockID query parameter', async () => {
    const blockID = '1e9bce514b1f80b2f322b160ed693c904e5e414bf6c2db4d15b40f842e6e5eca';
    const response = await request(app.getHttpServer())
      .get('/blocks')
      .query({ blockID })
      .expect(200);

    const data = response.body.data;
    expect(response.body).toBeDefined();
    expect(data.length).toBe(1);
    expect(data.at(0).id).toBe(blockID);
  });

  it('should fetch blocks with height query parameter', async () => {
    const height = '80:100';
    const limit = '20';
    const response = await request(app.getHttpServer())
      .get('/blocks')
      .query({ height, limit })
      .expect(200);

    const data = response.body.data;

    expect(response.body).toBeDefined();
    expect(data.length).toBe(20);
    expect(data.at(0).height).toBe(100);
    expect(data.at(-1).height).toBe(81);
  });

  it('should fetch blocks with timestamp query parameter', async () => {
    const timestamp = '1717607346:1717607390';
    const response = await request(app.getHttpServer())
      .get('/blocks')
      .query({ timestamp })
      .expect(200);

    const data = response.body.data;
    expect(response.body).toBeDefined();
    expect(data.length).toBe(7);
    expect(data.at(0).timestamp).toBe(1717607388);
    expect(data.at(-1).timestamp).toBe(1717607346);
  });

  it('should fetch blocks with generatorAddress query parameter', async () => {
    const generatorAddress = 'kly57ssb9hfpj7bygpsppwfgf822zjzuq77z2qgyu';
    const limit = '25';
    const response = await request(app.getHttpServer())
      .get('/blocks')
      .query({ generatorAddress, limit })
      .expect(200);

    const data = response.body.data;
    expect(response.body).toBeDefined();
    data.forEach((block) => {
      expect(block.generator.address).toBe(generatorAddress);
    });
  });

  it('should fetch blocks with sort query parameter', async () => {
    const sort = 'timestamp:asc';
    const response = await request(app.getHttpServer()).get('/blocks').query({ sort }).expect(200);

    const data = response.body.data;
    expect(response.body).toBeDefined();
    expect(data.at(0).timestamp).toBeLessThanOrEqual(data.at(-1).timestamp);
  });

  it('should fetch blocks with limit query parameter', async () => {
    const limit = 5;
    const response = await request(app.getHttpServer()).get('/blocks').query({ limit }).expect(200);

    const data = response.body.data;
    expect(data).toBeDefined();
    expect(data.length).toBeLessThanOrEqual(limit);
  });

  it('should fetch blocks with offset query parameter', async () => {
    const offset = 5;
    const response = await request(app.getHttpServer())
      .get('/blocks')
      .query({ offset })
      .expect(200);

    const data = response.body.data;
    expect(response.body).toBeDefined();
    expect(data.at(0).height).toBe(2495);
    expect(data.at(-1).height).toBe(2486);
  });

  it('should fetch blocks with includeAssets query parameter', async () => {
    const includeAssets = true;
    const response = await request(app.getHttpServer())
      .get('/blocks')
      .query({ includeAssets })
      .expect(200);

    const data = response.body.data;
    expect(response.body).toBeDefined();
    data.forEach((block) => {
      expect(block.assets).toBeDefined();
    });
  });
});

// import * as fs from 'fs';
// import * as path from 'path';
// writeToJson(filename: string, data: any): void {
//   const filePath = path.join(__dirname, filename);
//   fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
// }
