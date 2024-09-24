import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayResponse } from 'src/utils/controller-helpers';
import {
  GetTokenSummaryResponseDto,
  getTokenSummaryResponse,
} from './dto/get-token-summary-res.dto';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { EscrowedAmounts, SupportedTokens, TotalSupply } from 'src/modules/node-api/types';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { getAccountExistsResponse } from './dto/get-token-account-exists-res.dto';
import { GetAccountExistsDto } from './dto/get-token-account-exists.dto';
import e from 'express';

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

  @Get('account/exists')
  @ApiResponse(getAccountExistsResponse)
  async getTokenAccountExists(
    @Query() query: GetAccountExistsDto,
  ): Promise<GatewayResponse<{ isExists: boolean }>> {
    const { address, publicKey, name, tokenID } = query;

    const account = await this.prisma.account.findFirst({
      where: {
        OR: [{ address }, { publicKey }, { name }],
      },
    });

    if (!account) {
      return new GatewayResponse({ isExists: false }, {});
    }

    const tokenIDAccount = await this.nodeApi.invokeApi<{ exists: boolean }>(
      NodeApi.TOKEN_HAS_USER_ACCOUNT,
      {
        address: account.address,
        tokenID,
      },
    );

    return new GatewayResponse({ isExists: tokenIDAccount.exists }, {});
  }
}
