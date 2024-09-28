import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { NodeApi, NodeApiService } from '../node-api/node-api.service';
import { GatewayResponse } from 'src/utils/controller-helpers';
import { NFTBalance } from '../node-api/types';
import { getNFTbalanceResponse, GetNFTBalanceResponseDto } from './dto/get-nft-balance-res.dto';
import { GetNFTBalanceDto } from './dto/get-nft-balance.dto';

@ApiTags('NFT (only when Module is enabled)')
@Controller('nft')
export class NftController {
  constructor(private readonly nodeApi: NodeApiService) {}

  @Get('balances')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getNFTbalanceResponse)
  async getTokenAvailableIds(
    @Query() query: GetNFTBalanceDto,
  ): Promise<GatewayResponse<GetNFTBalanceResponseDto[]>> {
    const { address } = query;

    const { nfts } = await this.nodeApi.invokeApi<NFTBalance>(NodeApi.NFT_GET_NFTS, {
      address,
    });

    return new GatewayResponse(nfts, { total: nfts.length });
  }
}
