import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { GatewayResponse } from 'src/utils/controller-helpers';
import { GetBlockchainMetaDto } from './dto/get-blockchain-apps-meta.dto';
import { Prisma } from '@prisma/client';
import { GetAppsMetaResDto, getAppsMetaResponse } from './dto/get-blockchain-apps-meta-res.dto';
import { GetBlockchainTokensMetaDto } from './dto/get-blockchain-apps-tokens.dto';
import {
  GetTokensMetaResDto,
  getTokensMetaResponse,
} from './dto/get-blockchain-apps-tokens-res.dto';
import { GetBlockchainAppsListDto } from './dto/get-blockchain-apps-meta-list.dto';
import { GetAppsListResDto, getAppsListRes } from './dto/get-blockchain-apps-meta-list-res.dto';

@ApiTags('Application Off-Chain Metadata')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('apps/meta')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getAppsMetaResponse)
  public async getAppsMeta(@Query() query: GetBlockchainMetaDto): Promise<GetAppsMetaResDto> {
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

  @Get('apps/meta/tokens')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getTokensMetaResponse)
  public async getTokensMeta(
    @Query() query: GetBlockchainTokensMetaDto,
  ): Promise<GetTokensMetaResDto> {
    const { chainName, chainID, tokenName, tokenID, network, search, limit, offset, sort } = query;

    const [sortField, sortOrder] = sort.split(':');

    const where: Prisma.TokenWhereInput = {
      ...(chainName && { app: { chainName: chainName } }),
      ...(chainID && { chainID: chainID }),
      ...(tokenName && { tokenName: { in: tokenName.split(',') } }),
      ...(tokenID && { tokenID: { in: tokenID.split(',') } }),
      ...(network && { app: { networkType: { in: network.split(',') } } }),
      ...(search && {
        app: { chainName: { contains: search, mode: 'insensitive' } },
      }),
    };

    const [tokens, total] = await Promise.all([
      this.prisma.token.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          [sortField]: sortOrder,
        },
        include: {
          app: {
            select: {
              chainName: true,
              networkType: true,
            },
          },
          logo: {
            select: {
              png: true,
              svg: true,
              tokenID: true,
            },
          },
          denomUnits: {
            select: {
              denom: true,
              decimals: true,
              aliases: true,
              tokenID: true,
            },
          },
        },
      }),
      this.prisma.token.count({ where }),
    ]);

    const flattenedTokens = tokens.map(({ app, ...token }) => ({
      chainName: app.chainName,
      networkType: app.networkType,
      ...token,
    }));

    return new GatewayResponse(flattenedTokens, { count: tokens.length, offset, total });
  }

  @Get('apps/meta/list')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getAppsListRes)
  public async getAppsList(@Query() query: GetBlockchainAppsListDto): Promise<GetAppsListResDto> {
    const { chainName, network, search, limit, offset, sort } = query;

    const [sortField, sortOrder] = sort.split(':');

    const where: Prisma.AppWhereInput = {
      ...(chainName && { chainName: { contains: chainName, mode: 'insensitive' } }),
      ...(network && { networkType: { in: network.split(',') } }),
      ...(search && { chainName: { contains: search, mode: 'insensitive' } }),
    };

    const [apps, total] = await Promise.all([
      this.prisma.app.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          [sortField]: sortOrder,
        },
        select: {
          chainID: true,
          chainName: true,
          networkType: true,
        },
      }),
      this.prisma.app.count({ where }),
    ]);

    return new GatewayResponse(apps, { count: apps.length, offset, total });
  }
}
