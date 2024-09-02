export interface ValidatorRegisteredData {
  name: string;
  address: string;
}

export interface ValidatorStakedData {
  senderAddress: string;
  validatorAddress: string;
  amount: string;
  result: number;
}

export interface ValidatorBannedData {
  address: string;
  height: number;
}

export interface ValidatorPunishedData {
  address: string;
  height: number;
}

export interface BlsKeyRegistrationData {
  proofOfPossession: string;
  blsKey: string;
}

export interface GeneratorKeyRegistration {
  generatorKey: string;
}

export enum ValidatorStatus {
  ACTIVE = 'active',
  INELIGIBLE = 'ineligible',
  STANDBY = 'standby',
  PUNISHED = 'punished',
  BANNED = 'banned',
}

export type ValidatorRewardMap = {
  height: number;
  totalRewards: bigint;
  sharedRewards: bigint;
  selfStakeRewards: bigint;
};
export type GeneratorInfo = { count: number; lastGeneratedHeight: number };
