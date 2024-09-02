export enum AssetTypes {
  AUTH = 'auth',
  DYNAMIC_REWARD = 'dynamicReward',
  FEE = 'fee',
  INTEROPERABILITY = 'interoperability',
  POS = 'pos',
  RANDOM = 'random',
  TOKEN = 'token',
  VALIDATORS = 'validators',
  REWARD_MINTED = 'rewardMinted',
  LOCK = 'lock',
}

export interface PosAsset {
  validators: Validator[];
  stakers: object[];
  genesisData: object;
}

export interface Validator {
  address: string;
  name: string;
  blsKey: string;
  proofOfPossession: string;
  generatorKey: string;
  lastGeneratedHeight: number;
  isBanned: boolean;
  reportMisbehaviorHeights: number[];
  consecutiveMissedBlocks: number;
  commission: number;
  lastCommissionIncreaseHeight: number;
  sharingCoefficients: object[];
}
