import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { getAccountsRes } from './dto/get-accounts-res.dto';
import { GatewayResponse } from 'src/utils/controller-helpers';
import { GetAccountsDto } from './dto/get-accounts.dto';
import { Prisma } from '@prisma/client';
import { MAX_ACCOUNTS_TO_FETCH } from 'src/utils/constants';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getAccountsRes)
  async getAccounts(@Query() query: GetAccountsDto): Promise<GatewayResponse<any[]>> {
    const { address, name, publicKey, offset, sort, limit } = query;
    const [field, direction] = sort.split(':');
    const take = Math.min(limit, MAX_ACCOUNTS_TO_FETCH);

    const where: Prisma.AccountWhereInput = {
      ...(address && { address }),
      ...(name && { name }),
      ...(publicKey && { publicKey }),
    };

    const accounts = await this.prisma.account.findMany({
      where,
      take,
      orderBy: {
        [field]: direction,
      },
      skip: offset,
    });

    const total = await this.prisma.account.count({ where });

    const response = accounts.map((account) => ({
      ...account,
      availableBalance: account.availableBalance.toString(),
      lockedBalance: account.lockedBalance.toString(),
      totalBalance: account.totalBalance.toString(),
    }));

    return new GatewayResponse(response, { count: accounts.length, offset, total });
  }
}
