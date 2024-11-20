import { ApiResponseOptions } from '@nestjs/swagger';

export class BasicStats {
  connectedPeers: number;
  disconnectedPeers: number;
  totalPeers: number;
}

export class HeightStats {
  [key: string]: number;
}

export class NetworkVersionStats {
  [key: string]: number;
}

export class GetNetworkPeersStats {
  height: HeightStats;
  networkVersion: NetworkVersionStats;
}

export class GetNetworkStatisticsData {
  basic: BasicStats;
  height: HeightStats;
  networkVersion: NetworkVersionStats;
}

export class GetNetworkStatisticsMeta {}

export class GetNetworkStatisticsResDto {
  data: GetNetworkStatisticsData;
  meta: GetNetworkStatisticsMeta;
}

export const getNetworkStatisticsRes: ApiResponseOptions = {
  status: 200,
  description: 'The network statistics has been successfully fetched.',
  type: GetNetworkStatisticsResDto,
};
