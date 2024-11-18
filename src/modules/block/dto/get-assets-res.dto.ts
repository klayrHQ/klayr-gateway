import { ApiResponseOptions } from '@nestjs/swagger';

class Asset {
  module: string;
  data: string;
}

class Block {
  id: string;
  height: number;
  timestamp: number;
}

export class GetAssetData {
  block: Block;
  assets: Asset[];
}

export class GetAssetMeta {
  count: number;
  offset: number;
  total: number;
}

export class GetAssetResDto {
  data: GetAssetData[];
  meta: GetAssetMeta;
}

export const getAssetsResponse: ApiResponseOptions = {
  status: 200,
  description: 'The assets have been successfully fetched.',
  type: GetAssetResDto,
};
