import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayResponse } from 'src/utils/controller-helpers';
import { GetAppsDto } from './dto/get-apps.dto';
import { getAppsResponse } from './dto/get-apps-res.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Interoperability')
@Controller('blockchain')
export class InteroperabilityController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('apps')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getAppsResponse)
  async getAuth(@Query() query: GetAppsDto): Promise<GatewayResponse<any>> {
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
}
