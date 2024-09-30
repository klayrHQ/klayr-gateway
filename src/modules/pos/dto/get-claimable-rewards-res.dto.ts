import { ApiResponseOptions } from '@nestjs/swagger';

class ClaimableRewards {
  tokenID: string;
  reward: string;
}

export class GetClaimableRewardsResponseDto {
  rewards: ClaimableRewards[];
}

export const getClaimableRewardsResponse: ApiResponseOptions = {
  status: 200,
  description: 'The validator counts have been successfully fetched.',
  type: GetClaimableRewardsResponseDto,
  isArray: true,
};
