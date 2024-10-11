import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { GatewayResponse } from 'src/utils/controller-helpers';
import { GetBlockchainMetaDto } from './dto/get-blockchain-apps-meta.dto';
import { Prisma } from '@prisma/client';
import { GetAppsMetaResDto, getAppsMetaResponse } from './dto/get-blockchain-apps-meta-res.dto';

@ApiTags('Application Off-Chain Metadata')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('apps/meta')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getAppsMetaResponse)
  public async getAppsMeta(
    @Query() query: GetBlockchainMetaDto,
  ): Promise<GatewayResponse<GetAppsMetaResDto[]>> {
    const { chainName, displayName, chainID, isDefault, network, search, limit, offset, sort } =
      query;

    const [sortField, sortOrder] = sort.split(':');

    const where: Prisma.AppWhereInput = {
      ...(chainName && { chainName: { contains: chainName, mode: 'insensitive' } }),
      ...(displayName && { displayName: { contains: displayName, mode: 'insensitive' } }),
      ...(chainID && { chainID: { in: chainID.split(',') } }),
      ...(isDefault !== undefined && { isDefault }),
      ...(network && { networkType: { in: network.split(',') } }),
      ...(search && {
        OR: [
          { chainName: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [apps, total] = await Promise.all([
      this.prisma.app.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          [sortField]: sortOrder,
        },
        include: {
          serviceURLs: {
            select: {
              http: true,
              ws: true,
              apiCertificatePublicKey: true,
              appChainID: true,
            },
          },
          logo: {
            select: {
              png: true,
              svg: true,
              appChainID: true,
            },
          },
          explorers: {
            select: {
              url: true,
              txnPage: true,
              appChainID: true,
            },
          },
          appNodes: {
            select: {
              url: true,
              maintainer: true,
              apiCertificatePublicKey: true,
              appChainID: true,
            },
          },
        },
      }),
      this.prisma.app.count({ where }),
    ]);

    return new GatewayResponse(apps, { count: apps.length, offset, total });
  }
}
