import { ApiResponseOptions } from '@nestjs/swagger';

export class GetTokenBalanceResponseDto {
  tokenID: string;
  availableBalance: string;
  lockedBalance: {
    amount: string;
    module: string;
  }[];
}

export const getTokenBalanceResponse: ApiResponseOptions = {
  status: 200,
  description: 'The account have been successfully fetched.',
  type: GetTokenBalanceResponseDto,
  isArray: true,
};
