import { ApiResponseOptions } from '@nestjs/swagger';

class ExtraCommandFees {
  validatorRegistrationFee: string;
}

export class GetPosConstantsData {
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
  extraCommandFees: ExtraCommandFees;
}

export class GetPosConstantsMeta {}

export class GetPosConstantsResDto {
  data: GetPosConstantsData;
  meta: GetPosConstantsMeta;
}

export const getPosConstantsRes: ApiResponseOptions = {
  status: 200,
  description: 'The Pos constants have been successfully fetched.',
  type: GetPosConstantsResDto,
};
