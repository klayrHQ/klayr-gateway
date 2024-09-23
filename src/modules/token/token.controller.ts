import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayResponse } from 'src/utils/controller-helpers';
import {
  GetTokenSummaryResponseDto,
  getTokenSummaryResponse,
} from './dto/get-token-summary-res.dto';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { EscrowedAmounts, SupportedTokens, TotalSupply } from 'src/modules/node-api/types';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@ApiTags('Token')
@Controller('token')
export class TokenController {
  constructor(
    private readonly nodeApi: NodeApiService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('summary')
  @ApiResponse(getTokenSummaryResponse)
  async getTokenSummary(): Promise<GatewayResponse<GetTokenSummaryResponseDto>> {
    const [escrowedAmounts, totalSupply, supportedTokens, totalAccounts, totalTransactions] =
      await Promise.all([
        this.nodeApi.invokeApi<EscrowedAmounts>(NodeApi.TOKEN_GET_ESCROWED_AMOUNTS, {}),
        this.nodeApi.invokeApi<TotalSupply>(NodeApi.TOKEN_GET_TOTAL_SUPPLY, {}),
        this.nodeApi.invokeApi<SupportedTokens>(NodeApi.TOKEN_GET_SUPPORTED_TOKENS, {}),
        this.prisma.account.count({}),
        this.prisma.transaction.count({}),
      ]);

    const flattenedResponse = {
      escrowedAmounts: escrowedAmounts.escrowedAmounts,
      totalSupply: totalSupply.totalSupply,
      supportedTokens: supportedTokens.supportedTokens,
      totalAccounts,
      totalTransactions,
    };

    return new GatewayResponse(flattenedResponse, {});
  }
}
