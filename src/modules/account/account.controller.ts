import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { getAccountsRes, GetAccountsResDto } from './dto/get-accounts-res.dto';
import { GatewayResponse } from 'src/utils/controller-helpers';
import { GetAccountsDto } from './dto/get-accounts.dto';
import { Prisma } from '@prisma/client';
import { MAX_ACCOUNTS_TO_FETCH } from 'src/config/constants';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getAccountsRes)
  async getAccounts(@Query() query: GetAccountsDto): Promise<GetAccountsResDto> {
    const { address, name, publicKey, offset, limit } = query;
    const take = Math.min(limit, MAX_ACCOUNTS_TO_FETCH);

    const where: Prisma.AccountWhereInput = {
      ...(address && { address }),
      ...(name && { name }),
      ...(publicKey && { publicKey }),
    };

    const accounts = await this.prisma.account.findMany({
      where,
      take,
      include: {
        tokenBalances: true,
      },
      skip: offset,
    });

    const total = await this.prisma.account.count({ where });

    // ? can this be done in a better way?
    const response = accounts.map((account) => {
      const tokenBalances = account.tokenBalances.reduce((acc, balance) => {
        const tokenID = balance.tokenID;
        if (!acc[tokenID]) {
          acc[tokenID] = [];
        }
        acc[tokenID].push({
          availableBalance: balance.availableBalance.toString(),
          lockedBalance: balance.lockedBalance.toString(),
          totalBalance: balance.totalBalance.toString(),
        });
        return acc;
      }, {});

      return {
        ...account,
        tokenBalances,
      };
    });

    return new GatewayResponse(response, { count: accounts.length, offset, total });
  }
}
