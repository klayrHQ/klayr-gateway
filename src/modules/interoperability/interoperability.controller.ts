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
import { GetAppsDto } from './dto/get-apps.dto';
import { getAppsRes, GetAppsResDto } from './dto/get-apps-res.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NodeApi, NodeApiService } from '../node-api/node-api.service';
import { AnnualInflation } from '../node-api/types';
import { GetAppsStatsResDto, getAppsStatsRes } from './dto/get-app-stats-res.dto';
import { APP_STATUS } from './types';

@ApiTags('Interoperability')
@Controller('blockchain')
export class InteroperabilityController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  @Get('apps')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getAppsRes)
  async getAuth(@Query() query: GetAppsDto): Promise<GetAppsResDto> {
    const { chainID, chainName, status, search, limit, offset } = query;

    const where: Prisma.BlockchainAppWhereInput = {
      ...(chainName && { chainName: chainName }),
      ...(chainID && { chainID: { in: chainID.split(',') } }),
      ...(status && { status: status }),
      ...(search && {
        chainName: { contains: search, mode: 'insensitive' },
      }),
    };

    const [apps, total] = await Promise.all([
      this.prisma.blockchainApp.findMany({
        where,
        take: limit,
        skip: offset,
        include: { escrow: true },
      }),
      this.prisma.blockchainApp.count({ where }),
    ]);

    return new GatewayResponse(apps, { total, limit, offset });
  }

  @Get('apps/statistics')
  @ApiResponse(getAppsStatsRes)
  async getSummary(): Promise<GetAppsStatsResDto> {
    const [registered, activated, terminated, totalSupply, escrowedKLY] = await Promise.all([
      this.prisma.blockchainApp.count({ where: { status: APP_STATUS.REGISTERED } }),
      this.prisma.blockchainApp.count({ where: { status: APP_STATUS.ACTIVATED } }),
      this.prisma.blockchainApp.count({ where: { status: APP_STATUS.TERMINATED } }),
      this.getTotalSupplyAmount(),
      this.getTotalEscrowedAmount(),
    ]);

    const annualInflation = await this.nodeApi.invokeApi<AnnualInflation>(
      NodeApi.REWARD_GET_ANNUAL_INFLATION,
      {
        height: Number(this.nodeApi.nodeInfo.height),
      },
    );

    if (ControllerHelpers.isNodeApiError(annualInflation))
      throw new HttpException(annualInflation.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse(
      {
        registered,
        activated,
        terminated,
        totalSupplyKLY: totalSupply,
        totalStakedKLY: escrowedKLY,
        currentAnnualInflationRate: annualInflation.rate,
      },
      {},
    );
  }

  private getTotalEscrowedAmount(): string {
    const totalEscrowedAmount = this.nodeApi.tokenSummaryInfo.escrowedAmounts.escrowedAmounts
      .map((item) => parseFloat(item.amount))
      .reduce((acc, amount) => acc + amount, 0);

    return totalEscrowedAmount.toString();
  }

  private getTotalSupplyAmount(): string {
    const totalSupplyAmount = this.nodeApi.tokenSummaryInfo.totalSupply.totalSupply
      .map((item) => parseFloat(item.totalSupply))
      .reduce((acc, totalSupply) => acc + totalSupply, 0);

    return totalSupplyAmount.toString();
  }
}
