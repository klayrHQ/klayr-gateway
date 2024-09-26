import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { NodeApi, NodeApiService } from '../node-api/node-api.service';
import { getNetworkPeersRes, GetNetworkPeersResDto } from './dto/get-network-peers-res.dto';
import { GatewayResponse } from 'src/utils/controller-helpers';

@ApiTags('Network')
@Controller('network')
export class NetworkController {
  constructor(private readonly nodeApi: NodeApiService) {}

  // TODO: query params; sort, limit, offset, height, state, networkVersion, ip
  @Get('peers')
  @ApiResponse(getNetworkPeersRes)
  async getPeers(): Promise<GatewayResponse<GetNetworkPeersResDto[]>> {
    const peers = await this.nodeApi.invokeApi<GetNetworkPeersResDto[]>(
      NodeApi.NETWORK_GET_CONNECTED_PEERS,
      {},
    );

    return new GatewayResponse(peers, []);
  }
}
