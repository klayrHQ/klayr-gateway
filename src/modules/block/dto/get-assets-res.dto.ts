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

export class GetAssetResDto {
  block: Block;
  assets: Asset[];
}

export const getAssetsResponse: ApiResponseOptions = {
  status: 200,
  description: 'The assets have been successfully fetched.',
  type: GetAssetResDto,
  isArray: true,
};
