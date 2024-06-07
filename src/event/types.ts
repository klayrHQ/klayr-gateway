import { Asset, Block, Transaction } from 'src/node-api/types';

export enum Events {
  NEW_BLOCKS_EVENT = 'new.blocks.event',
  NEW_TX_EVENT = 'new.transaction.event',
  NEW_ASSETS_EVENT = 'new.assets.event',
}

export interface BlockEvent {
  event: Events;
  blocks: Block[];
}

export interface Payload<T> {
  height: number;
  data: T[];
}

export type TxOrAssetPayload = Payload<Asset | Transaction>;

export type TxOrAssetEvent = {
  event: Events;
  payload: TxOrAssetPayload[];
};
