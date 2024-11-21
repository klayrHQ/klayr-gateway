import { ApiResponseOptions, ApiProperty } from '@nestjs/swagger';

class LockedBalance {
  amount: string;
  module: string;
}

export class GetTokenTopBalanceData {
  address: string;
  publicKey: string;
  name: string;
  description?: string;
  totalBalance: string;
  availableBalance: string;
  lockedBalance: string;
}

export class GetTokenTopBalanceMeta {
  count: number;
  offset: number;
  total: number;
}

export class GetTokenTopBalanceResDto {
  data: { [tokenID: string]: GetTokenTopBalanceData[] };
  meta: GetTokenTopBalanceMeta;
}

export const getTokenTopBalanceRes: ApiResponseOptions = {
  status: 200,
  description: 'The top balances have been successfully fetched.',
  type: GetTokenTopBalanceResDto,
};
