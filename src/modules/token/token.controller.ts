import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayResponse } from 'src/utils/controller-helpers';
import {
  GetTokenSummaryResponseDto,
  getTokenSummaryResponse,
} from './dto/get-token-summary-res.dto';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { getAccountExistsResponse } from './dto/get-token-account-exists-res.dto';
import { GetAccountExistsDto } from './dto/get-token-account-exists.dto';

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
    const { escrowedAmounts, totalSupply, supportedTokens } = this.nodeApi.tokenSummaryInfo;
    const [totalAccounts, totalTransactions] = await Promise.all([
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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
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
