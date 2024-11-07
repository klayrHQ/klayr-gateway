import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  BLOCKS_TO_CACHE_TOKEN_SUMMARY,
  CACHED_SCHEMAS_ID,
  CONNECTION_TIMEOUT,
} from 'src/utils/constants';
import {
  EscrowedAmounts,
  GeneratorList,
  NodeInfo,
  SchemaModule,
  SupportedTokens,
  TokenInitializationFees,
  TotalSupply,
} from './types';
import { codec } from '@klayr/codec';
import { PrismaService } from '../prisma/prisma.service';
import { LokiLogger } from 'nestjs-loki-logger';
import { WebSocketClientService, WebSocketState } from './websocket/websocket.service';
import { OnEvent } from '@nestjs/event-emitter';

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
  REWARD_GET_ANNUAL_INFLATION = 'dynamicReward_getAnnualInflation',
  TXPOOL_DRY_RUN_TX = 'txpool_dryRunTransaction',
  TXPOOL_POST_TX = 'txpool_postTransaction',

  POS_GET_POS_TOKEN_ID = 'pos_getPoSTokenID',
  POS_GET_VALIDATOR = 'pos_getValidator',
  POS_GET_ALL_VALIDATORS = 'pos_getAllValidators',
  POS_GET_STAKER = 'pos_getStaker',
  POS_GET_CLAIMABLE_REWARDS = 'pos_getClaimableRewards',
  POS_GET_PENDING_UNLOCKS = 'pos_getPendingUnlocks',
  POS_GET_LOCKED_REWARD = 'pos_getLockedReward',

  TOKEN_GET_TOTAL_SUPPLY = 'token_getTotalSupply',
  TOKEN_GET_ESCROWED_AMOUNTS = 'token_getEscrowedAmounts',
  TOKEN_GET_SUPPORTED_TOKENS = 'token_getSupportedTokens',
  TOKEN_GET_BALANCE = 'token_getBalance',
  TOKEN_GET_BALANCES = 'token_getBalances',
  TOKEN_HAS_USER_ACCOUNT = 'token_hasUserAccount',
  TOKEN_GET_INITIALIZATION_FEES = 'token_getInitializationFees',

  AUTH_GET_AUTH_ACCOUNT = 'auth_getAuthAccount',

  NETWORK_GET_CONNECTED_PEERS = 'network_getConnectedPeers',

  NFT_GET_NFTS = 'nft_getNFTs',

  VALIDATORS_GET_VALIDATOR = 'validators_getValidator',
  VALIDATORS_VALIDATE_BLS_KEY = 'validators_validateBLSKey',

  FEE_GET_FEE_TOKEN_ID = 'fee_getFeeTokenID',
  FEE_GET_MIN_FEE_PER_BYTE = 'fee_getMinFeePerByte',

  INTEROPERABILITY_GET_ALL_CHAIN_ACCOUNTS = 'interoperability_getAllChainAccounts',
}

// Functions to interact with the Node API
@Injectable()
export class NodeApiService {
  private readonly logger = new LokiLogger(NodeApiService.name);
  private schemaMap: Map<string, SchemaModule>;
  public nodeInfo: NodeInfo;
  public generatorList: GeneratorList;
  public tokenSummaryInfo: {
    escrowedAmounts: EscrowedAmounts;
    totalSupply: TotalSupply;
    supportedTokens: SupportedTokens;
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly wsClient: WebSocketClientService,
  ) {}

  async onApplicationBootstrap() {
    await this.getAndSetSchemas();
    await this.cacheSchemas();
    await this.cacheConstantsOnStartup();
    await this.cacheNodeApiOnNewBlock(BLOCKS_TO_CACHE_TOKEN_SUMMARY);

    const subscribed = this.subscribeToNewBlock();
    if (!subscribed) setTimeout(() => this.subscribeToNewBlock, CONNECTION_TIMEOUT);
  }

  @OnEvent(WebSocketState.OPEN)
  async onConnected() {
    this.subscribeToNewBlock();
  }

  public async cacheNodeApiOnNewBlock(blockHeight: number) {
    const generatorList = await this.invokeApi<GeneratorList>(NodeApi.CHAIN_GET_GENERATOR_LIST, {});
    if (!generatorList) throw new InternalServerErrorException('Failed to fetch generator list');
    this.generatorList = generatorList;

    if (blockHeight % BLOCKS_TO_CACHE_TOKEN_SUMMARY === 0) {
      const escrowedAmounts = await this.invokeApi<EscrowedAmounts>(
        NodeApi.TOKEN_GET_ESCROWED_AMOUNTS,
        {},
      );
      const totalSupply = await this.invokeApi<TotalSupply>(NodeApi.TOKEN_GET_TOTAL_SUPPLY, {});
      const supportedTokens = await this.invokeApi<SupportedTokens>(
        NodeApi.TOKEN_GET_SUPPORTED_TOKENS,
        {},
      );
      this.tokenSummaryInfo = {
        escrowedAmounts,
        totalSupply,
        supportedTokens,
      };
    }
  }

  public async invokeApi<T>(endpoint: string, params: any): Promise<T> {
    return this.wsClient.invoke<T>(endpoint, params).catch((err) => {
      this.logger.error(err.message);
      throw new BadRequestException(err);
    });
  }

  // Have to avoid retrying here cause of memory leaks
  public subscribeToNewBlock(): boolean {
    try {
      return this.wsClient.subscribe(NodeApi.CHAIN_NEW_BLOCK);
    } catch (err) {
      this.logger.error(err.message);
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

  private async cacheConstantsOnStartup() {
    await this.cacheTokenConstants();
  }

  private async cacheTokenConstants() {
    const tokenInitializationFees = await this.invokeApi<TokenInitializationFees>(
      NodeApi.TOKEN_GET_INITIALIZATION_FEES,
      {},
    );

    await this.prisma.tokenConstants.upsert({
      where: { id: CACHED_SCHEMAS_ID },
      update: {
        userAccountInitializationFee: tokenInitializationFees.userAccount,
        escrowAccountInitializationFee: tokenInitializationFees.escrowAccount,
      },
      create: {
        id: CACHED_SCHEMAS_ID,
        userAccountInitializationFee: tokenInitializationFees.userAccount,
        escrowAccountInitializationFee: tokenInitializationFees.escrowAccount,
      },
    });
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
      where: { id: CACHED_SCHEMAS_ID },
      update: upsertData,
      create: {
        id: CACHED_SCHEMAS_ID,
        ...upsertData,
      },
    });
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

  // TODO: this is broken because it cannot use the ApiClient after custom ws client
  public calcMinFee(tx: any) {
    // return this.wsClient.transaction.computeMinFee(tx).toString();
    // return transactions.computeMinFee(tx).toString();
    return '152000';
  }

  private getSchemaModule(mod: string): SchemaModule {
    const schema = this.schemaMap.get(mod);
    if (!schema) {
      throw new BadRequestException(`Schema for module ${mod} not found`);
    }

    return schema;
  }
}
