import { ApiResponseOptions } from '@nestjs/swagger';

export class GetIndexStatusResDto {
  genesisHeight: number;
  lastBlockHeight: number;
  lastIndexedBlockHeight: number;
  chainLength: number;
  numBlocksIndexed: number;
  percentageIndexed: number;
  isIndexingInProgress: boolean;
}

export const getIndexStatusResponse: ApiResponseOptions = {
  status: 200,
  description: 'The node info has been successfully fetched.',
  type: GetIndexStatusResDto,
};
