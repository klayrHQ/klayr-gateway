export interface Block {
  header: BlockHeader;
  transactions: Transaction[];
  assets: Asset[];
}

export interface BlockHeader {
  version: number;
  timestamp: number;
  height: number;
  previousBlockID: string;
  stateRoot: string;
  assetRoot: string;
  eventRoot: string;
  transactionRoot: string;
  validatorsHash: string;
  aggregateCommit: {
    height: number;
    aggregationBits: string;
    certificateSignature: string;
  };
  generatorAddress: string;
  maxHeightPrevoted: number;
  maxHeightGenerated: number;
  impliesMaxPrevotes: boolean;
  signature: string;
  id: string;
  isFinal?: boolean;
}

export interface Transaction {
  id: string;
  module: string;
  command: string;
  params: string;
  nonce: string;
  fee: string;
  senderPublicKey: string;
  signatures: string[];
  decodedParams?: unknown;
}

export interface Asset {
  height?: number;
  module: string;
  data: string;
}

export interface NewBlockEvent {
  [key: string]: BlockHeader;
}

export interface NodeInfo {
  height: number;
  genesisHeight: number;
  finalizedHeight: number;
  [key: string]: unknown;
}

export interface RewardAtHeight {
  reward: string;
}

export type SchemaModule = {
  name: string;
  commands: any[];
  events: any[];
  stores: any[];
  endpoints: any[];
  assets: any[];
};

export type Schema = {
  modules: SchemaModule[];
};

export type ChainEvent = {
  data: string | object;
  index: number;
  module: string;
  name: string;
  topics: string[] | string;
  height: number;
  transactionID?: string;
};

export type ValidatorInfo = {
  name: string;
  totalStake: string;
  selfStake: string;
  lastGeneratedHeight: number;
  isBanned: boolean;
  reportMisbehaviorHeights: number[];
  consecutiveMissedBlocks: number;
  commission: number;
  lastCommissionIncreaseHeight: number;
  sharingCoefficients: SharingCoefficient[];
  address: string;
  punishmentPeriods: any[];
};

export type SharingCoefficient = {
  tokenID: string;
  coefficient: string;
};

export type ValidatorKeys = {
  generatorKey: string;
  blsKey: string;
};
