import { Injectable } from '@nestjs/common';
import { NodeApi } from 'src/modules/node-api/node-api.service';
import { Block, NewBlockEvent, SchemaModule } from 'src/modules/node-api/types';
import * as fs from 'fs';
import * as path from 'path';
import { codec } from '@klayr/codec';
import { CACHED_MODELS_ID } from 'src/config/constants';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class MockNodeApiService {
  nodeInfo = {
    height: 100,
    genesisHeight: 1,
  };
  private schemaMap: Map<string, SchemaModule>;

  constructor(private readonly prisma: PrismaService) {}

  async getAndSetNodeInfo() {
    return this.nodeInfo;
  }

  async onApplicationBootstrap() {
    await this.getAndSetSchemas();
    await this.cacheSchemas();
  }

  async invokeApi<T>(method: string, _: any): Promise<T> {
    if (method === NodeApi.REWARD_GET_DEFAULT_REWARD_AT_HEIGHT) {
      return {
        tokenID: '00000000',
        defaultReward: '100',
      } as T;
    }
    if (method === NodeApi.REWARD_GET_EXPECTED_VALIDATOR_REWARDS) {
      return {
        blockReward: '100',
      } as T;
    }
    if (method === NodeApi.CHAIN_GET_BLOCK_BY_HEIGHT) {
      const filePath = path.join(__dirname, './data/genesis-block.json');
      const blockJson = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(blockJson) as Block as T;
    }
    if (method === NodeApi.SYSTEM_GET_SCHEMA) {
      const filePath = path.join(__dirname, './data/schema.json');
      const schemaJson = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(schemaJson) as T;
    }
    if (method === NodeApi.SYSTEM_GET_METADATA) {
      const filePath = path.join(__dirname, './data/metadata.json');
      const metadataJson = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(metadataJson) as T;
    }
    if (method === NodeApi.CHAIN_GET_EVENTS) {
      const filePath = path.join(__dirname, './data/chainEvents.json');
      const metadataJson = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(metadataJson) as T;
    }
    if (method === 'block_array') {
      const filePath = path.join(__dirname, './data/newBlockData.json');
      const blockJson = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(blockJson) as NewBlockEvent as T;
    }
    return {} as T;
  }

  private async getAndSetSchemas() {
    const schema = await this.invokeApi<any>(NodeApi.SYSTEM_GET_METADATA, {});
    this.schemaMap = new Map(schema.modules.map((schema: SchemaModule) => [schema.name, schema]));
  }

  private async cacheSchemas() {
    const schema = await this.invokeApi<any>(NodeApi.SYSTEM_GET_SCHEMA, {});
    const metadata = await this.invokeApi<any>(NodeApi.SYSTEM_GET_METADATA, {});

    const registeredModules = metadata.modules.map((module: any) => module.name);
    const moduleCommands = metadata.modules.flatMap((module: any) =>
      module.commands.map((command: any) => `${module.name}:${command.name}`),
    );

    const upsertData = {
      schema: JSON.stringify(schema),
      metaData: JSON.stringify(metadata),
      registeredModules,
      moduleCommands,
    };

    // Upsert to make sure it only exists once
    await this.prisma.cachedSchemas.upsert({
      where: { id: CACHED_MODELS_ID },
      update: upsertData,
      create: {
        id: CACHED_MODELS_ID,
        ...upsertData,
      },
    });
  }

  public decodeTxData(mod: string, command: string, data: string): unknown {
    const schema = this.getSchemaModule(mod);
    const commandSchema = schema.commands.find((c) => c.name === command);
    return codec.decodeJSON(commandSchema.params, Buffer.from(data, 'hex'));
  }

  public decodeEventData(mod: string, event: string, data: string): unknown {
    const schema = this.getSchemaModule(mod);
    const eventSchema = schema.events.find((e) => e.name === event);
    return codec.decodeJSON(eventSchema.data, Buffer.from(data, 'hex'));
  }

  public decodeAssetData(mod: string, data: string): unknown {
    const schema = this.getSchemaModule(mod);
    return codec.decodeJSON(schema.assets[0].data, Buffer.from(data, 'hex'));
  }

  private getSchemaModule(mod: string): SchemaModule {
    const schema = this.schemaMap.get(mod);

    return schema;
  }

  public calcMinFee(tx: any) {
    return '152000';
  }
}
