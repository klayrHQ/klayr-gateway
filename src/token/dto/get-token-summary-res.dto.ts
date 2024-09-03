import { ApiResponseOptions } from '@nestjs/swagger';

export type TotalSupply = {
  tokenID: string;
  totalSupply: string;
}[];

export type EscrowedAmounts = {
  escrowChainID: string;
  tokenID: string;
  amount: string;
}[];

export type SupportedTokens = string[];

export class GetTokenSummaryResponseDto {
  escrowedAmounts: EscrowedAmounts;
  totalSupply: TotalSupply;
  supportedTokens: SupportedTokens;
  totalAccounts: number;
  totalTransactions: number;
}

export const getTokenSummaryResponse: ApiResponseOptions = {
  status: 200,
  description: 'The token summary have been successfully fetched.',
  type: GetTokenSummaryResponseDto,
};
