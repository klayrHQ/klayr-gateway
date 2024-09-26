import { ApiResponseOptions } from '@nestjs/swagger';

export interface PeerOptions {
  height: number;
  maxHeightPrevoted: number;
  blockVersion: number;
  lastBlockID: string;
  legacy: any[];
}

export class GetNetworkPeersResDto {
  chainID: string;
  networkVersion: string;
  nonce: string;
  advertiseAddress: boolean;
  options: PeerOptions;
  ipAddress: string;
  port: number;
  peerId: string;
}

export const getNetworkPeersRes: ApiResponseOptions = {
  status: 200,
  description: 'The network peers has been successfully fetched.',
  type: GetNetworkPeersResDto,
  isArray: true,
};
