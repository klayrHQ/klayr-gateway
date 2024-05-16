////////////////////////////
///       Indexer       ///
////////////////////////////

export const NODE_URL = 'ws://127.0.0.1:7887/rpc-ws';
export const RETRY_TIMEOUT = 5000; // 5 sec
export const NUMBER_OF_BLOCKS_TO_SYNC_AT_ONCE = 20;
export enum NodeApi {
  SYSTEM_GET_NODE_INFO = 'system_getNodeInfo',
  CHAIN_NEW_BLOCK = 'chain_newBlock',
  CHAIN_GET_BLOCKS_BY_HEIGHT = 'chain_getBlocksByHeightBetween',
}
