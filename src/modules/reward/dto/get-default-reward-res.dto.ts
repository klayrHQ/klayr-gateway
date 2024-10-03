import { ApiResponseOptions } from '@nestjs/swagger';

export class GetDefaultRewardResDto {
  tokenID: string;
  defaultReward: string;
}

export const getDefaultRewardRes: ApiResponseOptions = {
  status: 200,
  description: 'The default reward have been successfully fetched.',
  type: GetDefaultRewardResDto,
};
