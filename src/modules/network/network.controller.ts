import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
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
import { NetworkStats } from '../node-api/types';
import {
  GetNetworkPeersStats,
  getNetworkStatisticsRes,
  GetNetworkStatisticsResDto,
  HeightStats,
  NetworkVersionStats,
} from './dto/get-network-statistics-res.dto';

@ApiTags('Network')
@Controller('network')
export class NetworkController {
  constructor(
    private readonly nodeApi: NodeApiService,
    private readonly prisma: PrismaService,
  ) {}

  // TODO: query params; sort, limit, offset, height, state, networkVersion, ip
  @Get('peers')
  @ApiResponse(getNetworkPeersRes)
  async getPeers(): Promise<GetNetworkPeersResDto> {
    const peers = await this.nodeApi.invokeApi<GetNetworkPeersData[]>(
      NodeApi.NETWORK_GET_CONNECTED_PEERS,
      {},
    );

    if (ControllerHelpers.isNodeApiError(peers))
      throw new HttpException(peers.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse(peers, {});
  }

  @Get('statistics')
  @ApiResponse(getNetworkStatisticsRes)
  async getStatistics(): Promise<GetNetworkStatisticsResDto> {
    const networkStats = await this.nodeApi.invokeApi<NetworkStats>(NodeApi.NETWORK_GET_STATS, {});
    if (ControllerHelpers.isNodeApiError(networkStats))
      throw new HttpException(networkStats.error, HttpStatus.NOT_FOUND);

    const peers = await this.nodeApi.invokeApi<GetNetworkPeersData[]>(
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

  private getNetworkPeersStats(peers: GetNetworkPeersData[]): GetNetworkPeersStats {
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
}
