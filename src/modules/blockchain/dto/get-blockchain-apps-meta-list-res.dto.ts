import { ApiResponseOptions } from '@nestjs/swagger';

export class GetAppsListData {
  chainID: string;
  chainName: string;
  networkType: string;
}

export class GetAppsListMeta {
  count: number;
  offset: number;
  total: number;
}

export class GetAppsListResDto {
  data: GetAppsListData[];
  meta: GetAppsListMeta;
}

export const getAppsListRes: ApiResponseOptions = {
  status: 200,
  description: 'The list of blockchain applications has been successfully fetched.',
  type: GetAppsListResDto,
};
