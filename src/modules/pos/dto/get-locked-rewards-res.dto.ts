import { ApiResponseOptions } from '@nestjs/swagger';

export class GetLockedRewardsData {
  tokenID: string;
  reward: string;
}

export class GetLockedRewardsMeta {
  account: object;
}

export class GetLockedRewardsResDto {
  data: GetLockedRewardsData[];
  meta: GetLockedRewardsMeta;
}

export const getLockedRewardsRes: ApiResponseOptions = {
  status: 200,
  description: 'The locked rewards have been successfully fetched.',
  type: GetLockedRewardsResDto,
};
