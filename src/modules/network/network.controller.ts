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
import { NodeApi, NodeApiService } from '../node-api/node-api.service';
import {
  GetNetworkPeersData,
  getNetworkPeersRes,
  GetNetworkPeersResDto,
} from './dto/get-network-peers-res.dto';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import { getNodeInfoResponse, NodeInfoDto } from '../node-api/dto/get-node-info-res.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NetworkPeers, NetworkStats } from '../node-api/types';
import {
  GetNetworkPeersStats,
  getNetworkStatisticsRes,
  GetNetworkStatisticsResDto,
  HeightStats,
  NetworkVersionStats,
} from './dto/get-network-statistics-res.dto';
import { GetNetworkPeersDto } from './dto/get-network-peers.dto';
import { MAX_NETWORK_PEERS_TO_FETCH } from 'src/config/constants';
import { Prisma } from '@prisma/client';

@ApiTags('Network')
@Controller('network')
export class NetworkController {
  constructor(
    private readonly nodeApi: NodeApiService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('peers')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getNetworkPeersRes)
  async getPeers(@Query() query: GetNetworkPeersDto): Promise<GetNetworkPeersResDto> {
    const { sort, limit, offset, height, state, networkVersion, ip } = query;
    const { field, direction } = ControllerHelpers.validateSortParameter(sort);
    const take = Math.min(limit, MAX_NETWORK_PEERS_TO_FETCH);

    const where: Prisma.NetworkPeerWhereInput = {
      ...(height && { height: Number(height) }),
      ...(state && { state }),
      ...(networkVersion && { networkVersion }),
      ...(ip && { ip }),
    };

    const [peers, total] = await Promise.all([
      this.prisma.networkPeer.findMany({
        where,
        take,
        orderBy: {
          [field]: direction,
        },
        skip: offset,
        include: {
          location: true,
        },
      }),
      this.prisma.networkPeer.count({ where }),
    ]);

    const peerResponse: GetNetworkPeersData[] = peers.map((peer) =>
      this.toGetNetworkPeersResponse(peer),
    );

    return new GatewayResponse(peerResponse, { count: peers.length, offset, total });
  }

  @Get('statistics')
  @ApiResponse(getNetworkStatisticsRes)
  async getStatistics(): Promise<GetNetworkStatisticsResDto> {
    const networkStats = await this.nodeApi.invokeApi<NetworkStats>(NodeApi.NETWORK_GET_STATS, {});
    if (ControllerHelpers.isNodeApiError(networkStats))
      throw new HttpException(networkStats.error, HttpStatus.NOT_FOUND);

    const peers = await this.nodeApi.invokeApi<NetworkPeers[]>(
      NodeApi.NETWORK_GET_CONNECTED_PEERS,
      {},
    );
    if (ControllerHelpers.isNodeApiError(peers))
      throw new HttpException(peers.error, HttpStatus.NOT_FOUND);

    const basic = {
      connectedPeers: networkStats.totalConnectedPeers,
      disconnectedPeers: networkStats.totalDisconnectedPeers,
      totalPeers: networkStats.totalConnectedPeers + networkStats.totalDisconnectedPeers,
    };

    const { height, networkVersion } = this.getNetworkPeersStats(peers);

    return new GatewayResponse({ basic, height, networkVersion }, {});
  }

  @Get('status')
  @ApiResponse(getNodeInfoResponse)
  async getNodeInfo(): Promise<NodeInfoDto> {
    const nodeInfo = this.nodeApi.nodeInfo;
    const schemasFromDB = await this.prisma.cachedSchemas.findFirst();

    return new GatewayResponse(
      {
        ...nodeInfo,
        registeredModules: schemasFromDB.registeredModules,
        moduleCommands: schemasFromDB.moduleCommands,
      },
      {},
    );
  }

  private getNetworkPeersStats(peers: NetworkPeers[]): GetNetworkPeersStats {
    const heightStats: HeightStats = {};
    const networkVersionStats: NetworkVersionStats = {};

    peers.forEach((peer) => {
      const height = peer.options.height.toString();
      if (heightStats[height]) {
        heightStats[height]++;
      } else {
        heightStats[height] = 1;
      }

      const networkVersion = peer.networkVersion;
      if (networkVersionStats[networkVersion]) {
        networkVersionStats[networkVersion]++;
      } else {
        networkVersionStats[networkVersion] = 1;
      }
    });

    return {
      height: heightStats,
      networkVersion: networkVersionStats,
    };
  }

  private toGetNetworkPeersResponse(peer: any): GetNetworkPeersData {
    return {
      ip: peer.ip,
      port: peer.port,
      networkVersion: peer.networkVersion,
      chainID: peer.chainID,
      state: peer.state,
      height: peer.height,
      location: peer.location,
    };
  }
}
