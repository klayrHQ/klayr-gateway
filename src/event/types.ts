import { Asset, Block, Transaction } from 'src/node-api/types';

export enum Events {
  NEW_BLOCKS_EVENT = 'new.blocks.event',
  NEW_TX_EVENT = 'new.transaction.event',
  NEW_ASSETS_EVENT = 'new.assets.event',
}

export enum GatewayEvents {
  UPDATE_BLOCK_FEE = 'update.block.fee',
  PROCESS_POS_ASSET = 'process.pos.asset',
  INDEXER_STATE_CHANGE_INDEXING = 'indexer.state.change.indexing',
  UPDATE_BLOCK_GENERATOR = 'update.block.generator',
}

export enum ChainEvents {
  DYNAMIC_REWARD_REWARD_MINTED = 'dynamicReward:rewardMinted',
  VALIDATORS_GENERATOR_KEY_REGISTRATION = 'validators:generatorKeyRegistration',
  VALIDATORS_BLS_KEY_REGISTRATION = 'validators:blsKeyRegistration',
  POS_VALIDATOR_REGISTERED = 'pos:validatorRegistered',
  POS_VALIDATOR_STAKED = 'pos:validatorStaked',
  POS_VALIDATOR_BANNED = 'pos:validatorBanned',
  POS_VALIDATOR_PUNISHED = 'pos:validatorPunished',
  POS_COMMISION_CHANGE = 'pos:commissionChange',
  POS_REWARDS_ASSIGNED = 'pos:rewardsAssigned',
  POS_COMMAND_EXECUTION_RESULT = 'pos:commandExecutionResult',
  TOKEN_COMMAND_EXECUTION_RESULT = 'token:commandExecutionResult',
  INTEROPERABILITY_COMMAND_EXECUTION_RESULT = 'interoperability:commandExecutionResult',
  FEE_INSUFFICIENT_FEE = 'fee:insufficientFee',
  FEE_GENERATOR_FEE_PROCESSED = 'fee:generatorFeeProcessed',
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
