import { ApiResponseOptions } from '@nestjs/swagger';

export class GetIndexStatusData {
  genesisHeight: number;
  lastBlockHeight: number;
  lastIndexedBlockHeight: number;
  chainLength: number;
  numBlocksIndexed: number;
  percentageIndexed: number;
  isIndexingInProgress: boolean;
}

export class GetIndexStatusMeta {
  lastUpdate: number;
}

export class GetIndexStatusResDto {
  data: GetIndexStatusData;
  meta: GetIndexStatusMeta;
}

export const getIndexStatusResponse: ApiResponseOptions = {
  status: 200,
  description: 'The node info has been successfully fetched.',
  type: GetIndexStatusResDto,
};
