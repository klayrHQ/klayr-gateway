import { ApiResponseOptions } from '@nestjs/swagger';

export interface PeerOptions {
  height: number;
  maxHeightPrevoted: number;
  blockVersion: number;
  lastBlockID: string;
  legacy: any[];
}

export class GetNetworkPeersData {
  chainID: string;
  networkVersion: string;
  nonce: string;
  advertiseAddress: boolean;
  options: PeerOptions;
  ipAddress: string;
  port: number;
  peerId: string;
}

export class GetNetworkPeersMeta {}

export class GetNetworkPeersResDto {
  data: GetNetworkPeersData[];
  meta: GetNetworkPeersMeta;
}

export const getNetworkPeersRes: ApiResponseOptions = {
  status: 200,
  description: 'The network peers has been successfully fetched.',
  type: GetNetworkPeersResDto,
};
