import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import {
  GetTokenSummaryResponseDto,
  getTokenSummaryResponse,
} from './dto/get-token-summary-res.dto';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { getAccountExistsResponse } from './dto/get-token-account-exists-res.dto';
import { GetAccountExistsDto } from './dto/get-token-account-exists.dto';
import { TokenBalances } from 'src/modules/node-api/types';
import {
  getTokenBalanceResponse,
  GetTokenBalanceResponseDto,
} from './dto/get-token-balance-res.dto';
import { GetTokenBalanceDto } from './dto/get-token-balance.dto';
import { GetTokenAvailableIdsDto } from './dto/get-token-available-ids.dto';
import { GetTokenAvailableIdsResDto } from './dto/get-token-available-ids-res.dto';
import { getTokenConstantsResponse } from './dto/get-token-constants-res.dto';
import { GetTokenTopBalanceDto } from './dto/get-token-top-balance.dto';
import { Prisma } from '@prisma/client';
import {
  getTokenTopBalanceRes,
  GetTokenTopBalanceResDto,
} from './dto/get-token-top-balances-res.dto';
import { MAX_TOP_BALANCES_TO_FETCH } from 'src/config/constants';

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
    const summary = this.nodeApi.tokenSummaryInfo;
    const [totalAccounts, totalTransactions] = await Promise.all([
      this.prisma.account.count({}),
      this.prisma.transaction.count({}),
    ]);

    const flattenedResponse = {
      escrowedAmounts: summary.escrowedAmounts.escrowedAmounts ?? [],
      totalSupply: summary.totalSupply.totalSupply ?? [],
      supportedTokens: summary.supportedTokens.supportedTokens ?? [],
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

    if (ControllerHelpers.isNodeApiError(tokenIDAccount))
      throw new HttpException(tokenIDAccount.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse({ isExists: tokenIDAccount.exists }, {});
  }

  @Get('balances')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getTokenBalanceResponse)
  async getBalancesForAddress(
    @Query() query: GetTokenBalanceDto,
  ): Promise<GatewayResponse<GetTokenBalanceResponseDto[]>> {
    const { address } = query;

    const tokenBalances = await this.nodeApi.invokeApi<TokenBalances>(NodeApi.TOKEN_GET_BALANCES, {
      address,
    });

    if (ControllerHelpers.isNodeApiError(tokenBalances))
      throw new HttpException(tokenBalances.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse(tokenBalances.balances, {});
  }

  @Get('balances/top')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getTokenTopBalanceRes)
  async getTopBalances(@Query() query: GetTokenTopBalanceDto): Promise<GetTokenTopBalanceResDto> {
    const { tokenID, sort, limit, offset } = query;
    const [field, direction] = sort.split(':');
    const take = Math.min(limit, MAX_TOP_BALANCES_TO_FETCH);

    const where: Prisma.TokenBalanceWhereInput = {
      ...(tokenID && { tokenID }),
    };

    const tokenBalances = await this.prisma.tokenBalance.findMany({
      where,
      take,
      orderBy: {
        [field]: direction,
      },
      include: {
        account: {
          select: {
            address: true,
            publicKey: true,
            name: true,
            description: true,
          },
        },
      },
      skip: offset,
    });

    const total = await this.prisma.tokenBalance.count({ where });

    const response = {
      [tokenID]: tokenBalances.map((balance) => {
        const { address, publicKey, name, description } = balance.account;
        return {
          address,
          publicKey,
          ...(name && { name }),
          ...(description && { description }),
          totalBalance: balance.totalBalance.toString(),
          availableBalance: balance.availableBalance.toString(),
          lockedBalance: balance.lockedBalance.toString(),
        };
      }),
    };

    return new GatewayResponse(response, { count: tokenBalances.length, offset, total });
  }

  @Get('available-ids')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getAccountExistsResponse)
  async getTokenAvailableIds(
    @Query() _: GetTokenAvailableIdsDto,
  ): Promise<GatewayResponse<GetTokenAvailableIdsResDto>> {
    // TODO: implement limit and sort, but makes no sense for the time being.
    // TODO: maybe cache? Slow invoke
    const availableIds = await this.nodeApi.invokeApi<string[]>(
      NodeApi.TOKEN_GET_SUPPORTED_TOKENS,
      {},
    );

    if (ControllerHelpers.isNodeApiError(availableIds))
      throw new HttpException(availableIds.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse({ tokenIDs: availableIds }, { total: availableIds.length });
  }

  @Get('constants')
  @ApiResponse(getTokenConstantsResponse)
  async getTokenConstants(): Promise<GatewayResponse<any>> {
    const tokenConstants = await this.prisma.tokenConstants.findFirst({
      select: {
        userAccountInitializationFee: true,
        escrowAccountInitializationFee: true,
      },
    });

    return new GatewayResponse({ extraCommandFees: tokenConstants }, {});
  }
}
