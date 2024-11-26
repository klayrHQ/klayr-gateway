import { ApiResponseOptions } from '@nestjs/swagger';

class Location {
  countryCode: string;
  countryName: string;
  hostName: string;
  ip: string;
  latitude: string;
  longitude: string;
}

export class GetNetworkPeersData {
  ip: string;
  port: number;
  networkVersion: string;
  chainID: string;
  state: string;
  height: number;
  location: Location;
}

export class GetNetworkPeersMeta {
  count: number;
  offset: number;
  total: number;
}

export class GetNetworkPeersResDto {
  data: GetNetworkPeersData[];
  meta: GetNetworkPeersMeta;
}

export const getNetworkPeersRes: ApiResponseOptions = {
  status: 200,
  description: 'The network peers has been successfully fetched.',
  type: GetNetworkPeersResDto,
};
