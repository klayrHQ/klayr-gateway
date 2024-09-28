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
  aggregateCommit:
    | {
        height: number;
        aggregationBits: string;
        certificateSignature: string;
      }
    | string;
  generatorAddress: string;
  maxHeightPrevoted: number;
  maxHeightGenerated: number;
  impliesMaxPrevotes: boolean;
  signature: string;
  id: string;
  isFinal?: boolean;
}

export interface ProcessedBlockHeader extends BlockHeader {
  aggregateCommit: string;
  reward: string;
  numberOfTransactions: number;
  numberOfAssets: number;
  numberOfEvents: number;
  totalForged: number;
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
  data: string;
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
  punishmentPeriods: PunishmentPeriod[];
};

export type AllValidators = {
  validators: ValidatorInfo[];
};

export type PunishmentPeriod = {
  start: number;
  end: number;
};

export type SharingCoefficient = {
  tokenID: string;
  coefficient: string;
};

export type ValidatorKeys = {
  generatorKey: string;
  blsKey: string;
};

export type Generator = {
  address: string;
  nextAllocatedTime: string;
  name?: string;
};

export type GeneratorList = {
  list: Generator[];
};

export type ExpectedValidatorRewards = {
  blockReward: string;
  dailyReward: string;
  monthlyReward: string;
  yearlyReward: string;
};

export type TotalSupply = {
  totalSupply: {
    tokenID: string;
    totalSupply: string;
  }[];
};

export type EscrowedAmounts = {
  escrowedAmounts: {
    escrowChainID: string;
    tokenID: string;
    amount: string;
  }[];
};

export type SupportedTokens = {
  supportedTokens: string[];
};

export type Staker = {
  stakes: {
    validatorAddress: string;
    amount: string;
    sharingCoefficients: SharingCoefficient[];
  }[];
  pendingUnlocks: {
    validatorAddress: string;
    amount: string;
    unstakeHeight: number;
  }[];
};

export type TokenBalance = {
  availableBalance: string;
  lockedBalances: { amount: string; module: string }[];
};

export type TokenBalances = {
  balances: {
    tokenID: string;
    availableBalance: string;
    lockedBalance: {
      amount: string;
      module: string;
    }[];
  }[];
};

type AttributesArray = {
  module: string;
  attributes: string;
};

export type NFTBalance = {
  nfts: {
    id: string;
    attributesArray: AttributesArray[];
    lockingModule: string;
  }[];
};
