import { ApiResponseOptions } from '@nestjs/swagger';

export class GetTokenAvailableIdsResDto {
  tokenIDs: string[];
}

export const getTokenAvailableIdsRes: ApiResponseOptions = {
  status: 200,
  description: 'The token available ids have been successfully fetched.',
  type: GetTokenAvailableIdsResDto,
};
