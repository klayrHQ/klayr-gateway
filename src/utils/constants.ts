////////////////////////////
///       General        ///
////////////////////////////

export const DB_CACHE_SIZE = 100;

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

////////////////////////////
///       Indexer        ///
////////////////////////////

export const KEY_NEXT_BLOCK_TO_SYNC = 1;
export const NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE = 2_500; // Can go to 7.5k give or take

////////////////////////////
///       Block          ///
////////////////////////////

export const DEFAULT_BLOCKS_TO_FETCH = 10;
export const MAX_BLOCKS_TO_FETCH = 100;

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
///       Search         ///
////////////////////////////

export const HEX_ADDRESS_LENGTH = 40;

////////////////////////////
///      Indexer Extra   ///
////////////////////////////

export const INSERT_KNOWN_ACCOUNTS = true;
export const KNOWN_ACCOUNTS_MAINNET_URL = 'https://static-data.klayr.xyz/known_mainnet.json';
export const KNOWN_ACCOUNTS_TESTNET_URL = 'https://static-data.klayr.xyz/known_testnet.json';
