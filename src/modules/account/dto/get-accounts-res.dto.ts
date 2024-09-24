import { ApiResponseOptions } from '@nestjs/swagger';

export class GetAccountsResDto {
  address: string;
  publicKey: string;
  name: string;
  nonce: string;
  totalBalance: string;
  availableBalance: string;
  lockedBalance: string;
}

export const getAccountsResponse: ApiResponseOptions = {
  status: 200,
  description: 'The accounts have been successfully fetched.',
  type: GetAccountsResDto,
  isArray: true,
};
