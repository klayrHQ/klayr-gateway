import { ApiResponseOptions } from '@nestjs/swagger';
import { Account } from 'src/account/types';

export class GetValidatorResponseDto {
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

export const getValidatorResponse: ApiResponseOptions = {
  status: 200,
  description: 'The validator have been successfully fetched.',
  type: GetValidatorResponseDto,
  isArray: true,
};

export class GetValidatorCountsResponseDto {
  active: number;
  ineligible: number;
  standby: number;
  punished: number;
  banned: number;
}

export const getValidatorCountsResponse: ApiResponseOptions = {
  status: 200,
  description: 'The validator counts have been successfully fetched.',
  type: GetValidatorCountsResponseDto,
};
