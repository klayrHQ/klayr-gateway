import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { getAccountsResponse } from './dto/get-accounts-res.dto';
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
  @ApiResponse(getAccountsResponse)
  async getAccounts(@Query() query: GetAccountsDto): Promise<GatewayResponse<any[]>> {
    const { address, offset, limit } = query;
    const take = Math.min(limit, MAX_ACCOUNTS_TO_FETCH);

    const where: Prisma.AccountWhereInput = {
      ...(address && { address: address }),
    };

    const account = await this.prisma.account.findMany({ where, take, skip: offset });

    return new GatewayResponse(account, {});
  }
}
