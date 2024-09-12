import { ApiResponseOptions } from '@nestjs/swagger';

export class SearchValidators {
  name: string;
  address: string;
  publicKey: string;
  rank: number;
}

export class SearchBlocks {
  height: number;
  id: string;
}

export class SearchTransactions {
  id: string;
  sender: string;
}

export class GetSearchResponse {
  validators: SearchValidators[];
  blocks: SearchBlocks[];
  transactions: SearchTransactions[];
}

export const getSearchResponse: ApiResponseOptions = {
  status: 200,
  description: 'The search results have been successfully fetched.',
  type: GetSearchResponse,
};
