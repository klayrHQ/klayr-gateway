import { ApiResponseOptions } from '@nestjs/swagger';
import { EscrowedAmounts, SupportedTokens, TotalSupply } from 'src/node-api/types';

export class GetTokenSummaryResponseDto {
  escrowedAmounts: EscrowedAmounts;
  totalSupply: TotalSupply;
  supportedTokens: SupportedTokens;
  totalAccounts: number;
  totalTransactions: number;
}

export const getTokenSummaryResponse: ApiResponseOptions = {
  status: 200,
  description: 'The validator have been successfully fetched.',
  type: GetTokenSummaryResponseDto,
};
