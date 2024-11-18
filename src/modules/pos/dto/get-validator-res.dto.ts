import { ApiResponseOptions } from '@nestjs/swagger';
import { off } from 'node:process';
import { Account } from 'src/modules/account/types';

export class GetValidatorData {
  account: Account;
  totalStake: string;
  selfStake: string;
  validatorWeight: string;
  blockReward: string;
  totalRewards: string;
  totalSharedRewards: string;
  totalSelfStakeRewards: string;
  nextAllocatedTime?: string;
  rank?: number;
  blsKey?: string;
  proofOfPossession?: string;
  generatorKey?: string;
  lastGeneratedHeight?: number;
  isBanned?: boolean;
  lastCommissionIncreaseHeight?: number;
  commission?: number;
  consecutiveMissedBlocks?: number;
  reportMisbehaviorHeights?: string;
  sharingCoefficients?: string;
  status?: string;
}

export class GetValidatorMeta {
  count: number;
  offset: number;
  total: number;
}

export class GetValidatorResDto {
  data: GetValidatorData[];
  meta: GetValidatorMeta;
}

export const getValidatorResponse: ApiResponseOptions = {
  status: 200,
  description: 'The validator have been successfully fetched.',
  type: GetValidatorResDto,
};

export class GetValidatorCountsData {
  active: number;
  ineligible: number;
  standby: number;
  punished: number;
  banned: number;
}

export class GetValidatorCountsMeta {}

export class GetValidatorCountsResDto {
  data: GetValidatorCountsData;
  meta: GetValidatorCountsMeta;
}

export const getValidatorCountsRes: ApiResponseOptions = {
  status: 200,
  description: 'The validator counts have been successfully fetched.',
  type: GetValidatorCountsResDto,
};
