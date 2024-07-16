////////////////////////////
///       Swagger API    ///
////////////////////////////

export const SWAGGERCONFIG = {
  title: 'Klayr Gateway API',
  description: 'The Klayr gateway API description',
  version: '0.0.1',
  route: 'api/v1/spec',
};

export const GLOBAL_PREFIX = 'api/v1';

////////////////////////////
///       Node API       ///
////////////////////////////

// export const NODE_URL = 'wss://testnet.klayr.xyz/rpc-ws'; MOVED TO ENV
export const RETRY_TIMEOUT = 5000; // 5 sec

////////////////////////////
///       Indexer        ///
////////////////////////////

export const KEY_NEXT_BLOCK_TO_SYNC = 1;
export const NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE = 5000; // Can go to 5k or 10k maybe more?

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
