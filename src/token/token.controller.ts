import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayResponse } from 'src/utils/controller-helpers';
import {
  GetTokenSummaryResponseDto,
  getTokenSummaryResponse,
} from './dto/get-token-summary-res.dto';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { EscrowedAmounts, SupportedTokens, TotalSupply } from 'src/node-api/types';
import { AccountRepoService } from 'src/account/account-repo.service';
import { TransactionRepoService } from 'src/transaction/transaction-repo.service';

@ApiTags('Token')
@Controller('token')
export class TokenController {
  constructor(
    private readonly nodeApi: NodeApiService,
    private readonly accountsRepo: AccountRepoService,
    private readonly transactionRepo: TransactionRepoService,
  ) {}

  @Get('summary')
  @ApiResponse(getTokenSummaryResponse)
  async getTokenSummary(): Promise<GatewayResponse<GetTokenSummaryResponseDto>> {
    const [escrowedAmounts, totalSupply, supportedTokens, totalAccounts, totalTransactions] =
      await Promise.all([
        this.nodeApi.invokeApi<EscrowedAmounts>(NodeApi.TOKEN_GET_ESCROWED_AMOUNTS, {}),
        this.nodeApi.invokeApi<TotalSupply>(NodeApi.TOKEN_GET_TOTAL_SUPPLY, {}),
        this.nodeApi.invokeApi<SupportedTokens>(NodeApi.TOKEN_GET_SUPPORTED_TOKENS, {}),
        this.accountsRepo.countAccounts(),
        this.transactionRepo.countTransactions({}),
      ]);

    return new GatewayResponse(
      { escrowedAmounts, totalSupply, supportedTokens, totalAccounts, totalTransactions },
      {},
    );
  }
}
