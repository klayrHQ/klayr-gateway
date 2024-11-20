import { ApiResponseOptions } from '@nestjs/swagger';

export class GetRewardConstantsData {
  rewardTokenID: string;
}

export class GetRewardConstantsMeta {}

export class GetRewardConstantsResDto {
  data: GetRewardConstantsData;
  meta: GetRewardConstantsMeta;
}

export const getRewardConstantsRes: ApiResponseOptions = {
  status: 200,
  description: 'The reward constants have been successfully fetched.',
  type: GetRewardConstantsResDto,
};
