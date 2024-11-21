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

interface GenesisBlock {
  fromFile: string;
}

interface Genesis {
  block: GenesisBlock;
  blockTime: number;
  bftBatchSize: number;
  maxTransactionsSize: number;
  minimumCertifyHeight: number;
  chainID: string;
}

interface Network {
  version: string;
  port: number;
  seedPeers: string[];
}

export interface NodeInfo {
  version: string;
  networkVersion: string;
  chainID: string;
  lastBlockID: string;
  height: number;
  finalizedHeight: number;
  syncing: boolean;
  unconfirmedTransactions: number;
  genesisHeight: number;
  genesis: Genesis;
  network: Network;
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

export type ClaimableRewards = {
  rewards: {
    tokenID: string;
    reward: string;
  }[];
};

export type PosTokenID = {
  tokenID: string;
};

export type LockedReward = {
  reward: string;
};

export type ValidateBlsKey = {
  valid: boolean;
};

export type PendingUnlocks = {
  pendingUnlocks: {
    validatorAddress: string;
    amount: string;
    unstakeHeight: number;
    unlockable: boolean;
    expectedUnlockableHeight: number;
  }[];
};

export type NodeApiError = {
  error: string;
};

export type AnnualInflation = {
  tokenID: string;
  rate: string;
};

export type DefaultReward = {
  tokenID: string;
  defaultReward: string;
};

export type FeeTokenID = {
  tokenID: string;
};

export type MinFeePerByte = {
  minFeePerByte: number;
};

export type LastCertificate = {
  height: number;
  timestamp: number;
  stateRoot: string;
  validatorHash: string;
};

export type ChainAccount = {
  lastCertificate: LastCertificate;
  name: string;
  status: number;
};

export type ChainAccounts = {
  chains: ChainAccount[];
};

export type TokenInitializationFees = {
  userAccount: string;
  escrowAccount: string;
};

export type PosInitializationFees = {
  fee: string;
};

export type PosConstants = {
  factorSelfStakes: number;
  maxLengthName: number;
  maxNumberSentStakes: number;
  maxNumberPendingUnlocks: number;
  failSafeMissedBlocks: number;
  failSafeInactiveWindow: number;
  punishmentWindowStaking: number;
  punishmentWindowSelfStaking: number;
  roundLength: number;
  minWeightStandby: string;
  numberActiveValidators: number;
  numberStandbyValidators: number;
  posTokenID: string;
  validatorRegistrationFee: string;
  maxBFTWeightCap: number;
  commissionIncreasePeriod: number;
  maxCommissionIncreaseRate: number;
  useInvalidBLSKey: boolean;
  baseStakeAmount: string;
  lockingPeriodStaking: number;
  lockingPeriodSelfStaking: number;
  reportMisbehaviorReward: string;
  reportMisbehaviorLimitBanned: number;
  weightScaleFactor: string;
  defaultCommission: number;
};

export type NetworkStats = {
  startTime: number;
  incoming: {
    count: number;
    connects: number;
    disconnects: number;
  };
  outgoing: {
    count: number;
    connects: number;
    disconnects: number;
  };
  banning: {
    bannedPeers: Record<string, unknown>;
    count: number;
  };
  totalConnectedPeers: number;
  totalDisconnectedPeers: number;
  totalErrors: number;
  totalPeersDiscovered: number;
  totalRemovedPeers: number;
  totalMessagesReceived: Record<string, number>;
  totalRequestsReceived: Record<string, number>;
};
