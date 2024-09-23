import { apiClient } from '@klayr/client';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { RETRY_TIMEOUT } from 'src/utils/constants';
import { waitTimeout } from 'src/utils/helpers';
import { GeneratorList, NewBlockEvent, NodeInfo, SchemaModule } from './types';
import { codec } from '@klayr/codec';
import { Interval } from '@nestjs/schedule';

export enum NodeApi {
  SYSTEM_GET_NODE_INFO = 'system_getNodeInfo',
  SYSTEM_GET_SCHEMA = 'system_getSchema',
  SYSTEM_GET_METADATA = 'system_getMetadata',
  CHAIN_NEW_BLOCK = 'chain_newBlock',
  CHAIN_GET_BLOCK_BY_ID = 'chain_getBlockByID',
  CHAIN_GET_BLOCK_BY_HEIGHT = 'chain_getBlockByHeight',
  CHAIN_GET_BLOCKS_BY_HEIGHT = 'chain_getBlocksByHeightBetween',
  CHAIN_GET_EVENTS = 'chain_getEvents',
  CHAIN_VALIDATORS_CHANGED = 'chain_validatorsChanged',
  CHAIN_GET_GENERATOR_LIST = 'chain_getGeneratorList',
  REWARD_GET_DEFAULT_REWARD_AT_HEIGHT = 'dynamicReward_getDefaultRewardAtHeight',
  REWARD_GET_EXPECTED_VALIDATOR_REWARDS = 'dynamicReward_getExpectedValidatorRewards',
  TXPOOL_DRY_RUN_TX = 'txpool_dryRunTransaction',
  TXPOOL_POST_TX = 'txpool_postTransaction',
  POS_GET_VALIDATOR = 'pos_getValidator',
  POS_GET_ALL_VALIDATORS = 'pos_getAllValidators',
  POS_GET_STAKER = 'pos_getStaker',
  VALIDATORS_GET_VALIDATOR = 'validators_getValidator',
  TOKEN_GET_TOTAL_SUPPLY = 'token_getTotalSupply',
  TOKEN_GET_ESCROWED_AMOUNTS = 'token_getEscrowedAmounts',
  TOKEN_GET_SUPPORTED_TOKENS = 'token_getSupportedTokens',
  TOKEN_GET_BALANCE = 'token_getBalance',
  AUTH_GET_AUTH_ACCOUNT = 'auth_getAuthAccount',
}

// Functions to interact with the Node API
@Injectable()
export class NodeApiService {
  private readonly logger = new Logger(NodeApiService.name);
  private client: apiClient.APIClient;
  private schemaMap: Map<string, SchemaModule>;
  private subscription: any;
  public nodeInfo: NodeInfo;
  public generatorList: GeneratorList;

  async onModuleInit() {
    await this.connectToNode();
    await this.getAndSetSchemas();
  }

  // TODO: reconnect on disconnect
  public async connectToNode() {
    while (!this.client) {
      this.client = await apiClient.createWSClient(process.env.NODE_URL).catch(async (err) => {
        this.logger.error('Failed connecting to node, retrying...', err);
        await waitTimeout(RETRY_TIMEOUT);
        return null;
      });
    }
  }

  // TODO: Hacky way to reconnect. Need to implement a better way that works with the indexer subscribing
  @Interval(60_000) // 1 minute
  public async nodeStatus() {
    try {
      await this.client.node.getNetworkStats();
    } catch (err) {
      this.logger.error('Node is not reachable, reconnecting...');
      await apiClient.createWSClient(process.env.NODE_URL).then((client) => {
        this.client = client;
        this.subscribeToNewBlock(this.subscription);
      });
    }
  }

  public async cacheNodeApiOnNewBlock() {
    const generatorList = await this.invokeApi<GeneratorList>(NodeApi.CHAIN_GET_GENERATOR_LIST, {});
    if (!generatorList) throw new InternalServerErrorException('Failed to fetch generator list');

    this.generatorList = generatorList;
  }

  public async invokeApi<T>(endpoint: string, params: any): Promise<T> {
    return this.client.invoke<T>(endpoint, params).catch((err) => {
      this.logger.error(err);
      throw new BadRequestException(err);
    });
  }

  // Have to avoid retrying here cause of memory leaks
  public subscribeToNewBlock(callback: (data: NewBlockEvent) => void): void {
    this.subscription = callback;
    try {
      this.client.subscribe(NodeApi.CHAIN_NEW_BLOCK, async (data: unknown) => {
        const newBlockData = data as NewBlockEvent;
        callback(newBlockData);
      });
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(err);
    }
  }

  // Is being called every new block event in the block event service
  public async getAndSetNodeInfo(): Promise<NodeInfo> {
    this.nodeInfo = await this.invokeApi<NodeInfo>(NodeApi.SYSTEM_GET_NODE_INFO, {});
    return this.nodeInfo;
  }

  private async getAndSetSchemas() {
    const schema = await this.invokeApi<any>(NodeApi.SYSTEM_GET_METADATA, {});
    this.schemaMap = new Map(schema.modules.map((schema: SchemaModule) => [schema.name, schema]));
  }

  public decodeTxData(mod: string, command: string, data: string): unknown {
    const schema = this.getSchemaModule(mod);

    const commandSchema = schema.commands.find((c) => c.name === command);
    if (!commandSchema) {
      throw new BadRequestException(`Command ${command} not found in module ${mod}`);
    }

    return codec.decodeJSON(commandSchema.params, Buffer.from(data, 'hex'));
  }

  public decodeEventData(mod: string, event: string, data: string): unknown {
    const schema = this.getSchemaModule(mod);

    const eventSchema = schema.events.find((e) => e.name === event);
    if (!eventSchema) {
      throw new BadRequestException(`Event ${event} not found in module ${mod}`);
    }

    return codec.decodeJSON(eventSchema.data, Buffer.from(data, 'hex'));
  }

  public decodeAssetData(mod: string, data: string): unknown {
    const schema = this.getSchemaModule(mod);

    return codec.decodeJSON(schema.assets[0].data, Buffer.from(data, 'hex'));
  }

  public calcMinFee(tx: any) {
    return this.client.transaction.computeMinFee(tx).toString();
  }

  private getSchemaModule(mod: string): SchemaModule {
    const schema = this.schemaMap.get(mod);
    if (!schema) {
      throw new BadRequestException(`Schema for module ${mod} not found`);
    }

    return schema;
  }
}
