import { ApiResponseOptions } from '@nestjs/swagger';
import { Account } from '@prisma/client';

export class GetValidatorResponseDto {
  account: Account;
  totalStake: string;
  selfStake: string;
  validatorWeight: string;
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
}

export const getValidatorResponse: ApiResponseOptions = {
  status: 200,
  description: 'The validator have been successfully fetched.',
  type: GetValidatorResponseDto,
  isArray: false,
};
