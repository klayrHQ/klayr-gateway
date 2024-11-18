import { ApiResponseOptions } from '@nestjs/swagger';

export class GetDefaultRewardData {
  tokenID: string;
  defaultReward: string;
}

export class GetDefaultRewardMeta {}

export class GetDefaultRewardResDto {
  data: GetDefaultRewardData;
  meta: GetDefaultRewardMeta;
}

export const getDefaultRewardRes: ApiResponseOptions = {
  status: 200,
  description: 'The default reward have been successfully fetched.',
  type: GetDefaultRewardResDto,
};
