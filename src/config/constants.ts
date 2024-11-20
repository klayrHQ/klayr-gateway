////////////////////////////
///       General        ///
////////////////////////////

////////////////////////////
///       Swagger API    ///
////////////////////////////

export const SWAGGERCONFIG = {
  title: 'Klayr Gateway API',
  description: 'The Klayr gateway API description, base path is "api/v1"',
  version: '0.0.1',
  route: 'api/v1/spec',
};

export const GLOBAL_PREFIX = 'api/v1';

////////////////////////////
///       Node API       ///
////////////////////////////

export const RETRY_TIMEOUT = 5000; // 5 sec
export const BLOCKS_TO_CACHE_TOKEN_SUMMARY = 100;
export const CACHED_MODELS_ID = 1;

////////////////////////////
///       Indexer        ///
////////////////////////////

export const KEY_NEXT_BLOCK_TO_SYNC = 1;
export const NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE = 3_000; // Can go to 7k give or take

////////////////////////////
///       Block          ///
////////////////////////////

export const DEFAULT_BLOCKS_TO_FETCH = 10;
export const DEFAULT_ASSETS_TO_FETCH = 10;
export const MAX_BLOCKS_TO_FETCH = 100;
export const MAX_ASSETS_TO_FETCH = 100;

////////////////////////////
///       Transaction    ///
////////////////////////////

export const DEFAULT_TX_TO_FETCH = 10;
export const MAX_TXS_TO_FETCH = 100;

////////////////////////////
///       Events    ///
////////////////////////////

export const DEFAULT_EVENTS_TO_FETCH = 10;
export const MAX_EVENTS_TO_FETCH = 100;

////////////////////////////
///       Validator      ///
////////////////////////////

export const DEFAULT_VALIDATORS_TO_FETCH = 10;
export const MAX_VALIDATORS_TO_FETCH = 100;
export const MINIMUM_VALIDATOR_WEIGHT = BigInt(1_000e8);
export const ACTIVE_VALIDATORS = 51;

////////////////////////////
///       Stakes         ///
////////////////////////////

export const DEFAULT_STAKES_TO_FETCH = 20;
export const MAX_STAKES_TO_FETCH = 100;

////////////////////////////
///       Accounts      ///
////////////////////////////

export const DEFAULT_ACCOUNTS_TO_FETCH = 10;
export const MAX_ACCOUNTS_TO_FETCH = 100;

////////////////////////////
///       Accounts      ///
////////////////////////////

export const DEFAULT_TOP_BALANCES_TO_FETCH = 10;
export const MAX_TOP_BALANCES_TO_FETCH = 100;

////////////////////////////
///       Search         ///
////////////////////////////

export const HEX_ADDRESS_LENGTH = 40;
export const SEARCH_LIMIT = 20;
export const KLAYR_ADDRESS_LENGTH = 41;
export const KLAYR_TRANSACTION_ID_LENGTH = 64;

////////////////////////////
///      Indexer Extra   ///
////////////////////////////

export const KNOWN_ACCOUNTS_MAINNET_URL = 'https://static-data.klayr.xyz/known_mainnet.json';
export const KNOWN_ACCOUNTS_TESTNET_URL = 'https://static-data.klayr.xyz/known_testnet.json';

////////////////////////////
///    Websocket client  ///
////////////////////////////

export const CONNECTION_TIMEOUT = 10000;
export const RESPONSE_TIMEOUT = 10000;

////////////////////////////
///    Blockchain        ///
////////////////////////////

export enum BLOCKCHAIN_NETWORKS {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  DEVNET = 'devnet',
}
export const GITHUB_BASE_URL = 'https://api.github.com/repos/KlayrHQ/app-registry/contents';
