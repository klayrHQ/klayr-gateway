import { ApiResponseOptions } from '@nestjs/swagger';

export class TotalSupply {
  tokenID: string;
  totalSupply: string;
}

export class EscrowedAmounts {
  escrowChainID: string;
  tokenID: string;
  amount: string;
}

export class GetTokenSummaryResponseDto {
  escrowedAmounts: EscrowedAmounts[];
  totalSupply: TotalSupply[];
  supportedTokens: string[];
  totalAccounts: number;
  totalTransactions: number;
}

export const getTokenSummaryResponse: ApiResponseOptions = {
  status: 200,
  description: 'The token summary have been successfully fetched.',
  type: GetTokenSummaryResponseDto,
};
