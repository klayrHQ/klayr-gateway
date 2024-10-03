import { ApiResponseOptions } from '@nestjs/swagger';

export class GetLockedRewardsResDto {
  tokenID: string;
  reward: string;
}

export const getLockedRewardsResponse: ApiResponseOptions = {
  status: 200,
  description: 'The locked rewards have been successfully fetched.',
  type: GetLockedRewardsResDto,
  isArray: true,
};
