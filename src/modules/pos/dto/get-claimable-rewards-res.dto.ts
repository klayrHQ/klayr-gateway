import { ApiResponseOptions } from '@nestjs/swagger';

class ClaimableRewardsData {
  tokenID: string;
  reward: string;
}

export class GetClaimableRewardsMeta {
  account: object;
}
export class GetClaimableRewardsResDto {
  data: ClaimableRewardsData[];
  meta: GetClaimableRewardsMeta;
}

export const getClaimableRewardsRes: ApiResponseOptions = {
  status: 200,
  description: 'The claimable rewards have been successfully fetched.',
  type: GetClaimableRewardsResDto,
};
