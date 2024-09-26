import { ApiResponseOptions, ApiProperty } from '@nestjs/swagger';

class LockedBalance {
  amount: string;
  module: string;
}

export class GetTokenBalanceResponseDto {
  tokenID: string;
  availableBalance: string;
  lockedBalance: LockedBalance[];
}

export const getTokenBalanceResponse: ApiResponseOptions = {
  status: 200,
  description: 'The account have been successfully fetched.',
  type: GetTokenBalanceResponseDto,
  isArray: true,
};
