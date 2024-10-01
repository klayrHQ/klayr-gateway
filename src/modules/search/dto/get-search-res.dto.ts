import { ApiResponseOptions } from '@nestjs/swagger';

export class SearchAccounts {
  name: string;
  address: string;
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
  accounts: SearchAccounts[];
  blocks: SearchBlocks[];
  transactions: SearchTransactions[];
}

export const getSearchResponse: ApiResponseOptions = {
  status: 200,
  description: 'The search results have been successfully fetched.',
  type: GetSearchResponse,
};
