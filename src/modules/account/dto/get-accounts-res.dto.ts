import { ApiResponseOptions } from '@nestjs/swagger';

class TokenBalance {
  availableBalance: string;
  lockedBalance: string;
  totalBalance: string;
}
export class GetAccountsData {
  address: string;
  publicKey: string;
  name: string;
  nonce: string;
  description?: string;
  tokenBalances: Record<string, TokenBalance[]>;
}

export class GetAccountMeta {
  count: number;
  offset: number;
  total: number;
}

export class GetAccountsResDto {
  data: GetAccountsData[];
  meta: GetAccountMeta;
}

export const getAccountsRes: ApiResponseOptions = {
  status: 200,
  description: 'The accounts have been successfully fetched.',
  type: GetAccountsResDto,
};
