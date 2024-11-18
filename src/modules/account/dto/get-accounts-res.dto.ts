import { ApiResponseOptions } from '@nestjs/swagger';

export class GetAccountsData {
  address: string;
  publicKey: string;
  name: string;
  nonce: string;
  totalBalance: string;
  availableBalance: string;
  lockedBalance: string;
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
