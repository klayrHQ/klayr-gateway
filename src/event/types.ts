import { Asset, Block, Transaction } from 'src/node-api/types';

export enum Events {
  NEW_BLOCKS_EVENT = 'new.blocks.event',
  NEW_TX_EVENT = 'new.transaction.event',
  NEW_ASSETS_EVENT = 'new.assets.event',
}

export enum GatewayEvents {
  UPDATE_BLOCK_FEE = 'update.block.fee',
}

export enum ChainEvents {
  DYNAMIC_REWARD_REWARD_MINTED = 'dynamicReward:rewardMinted',
  VALIDATORS_GENERATOR_KEY_REGISTRATION = 'validators:generatorKeyRegistration',
  VALIDATORS_BLS_KEY_REGISTRATION = 'validators:blsKeyRegistration',
  POS_VALIDATOR_REGISTERED = 'pos:validatorRegistered',
}

// export enum TxEvents {
//   POS_STAKE = 'pos:stake',
//   POS_REGISTER_VALIDATOR = 'pos:registerValidator',
//   POS_CHANGE_COMMISSION = 'pos:changeCommission',
//   TOKEN_TRANSFER = 'token:transfer',
// }

export interface GeneralEvent {
  event: ChainEvents | GatewayEvents;
  payload: any;
  hash?: string;
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
