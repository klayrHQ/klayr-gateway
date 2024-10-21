import { ApiResponseOptions } from '@nestjs/swagger';

export class GetAppsListResDto {
  chainID: string;
  chainName: string;
  networkType: string;
}

export const getAppsListResponse: ApiResponseOptions = {
  status: 200,
  description: 'The list of blockchain applications has been successfully fetched.',
  type: GetAppsListResDto,
  isArray: true,
};
