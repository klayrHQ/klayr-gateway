import { ApiResponseOptions } from '@nestjs/swagger';

class GenesisBlock {
  fromFile: string;
}

class Genesis {
  block: GenesisBlock;
  blockTime: number;
  bftBatchSize: number;
  maxTransactionsSize: number;
  minimumCertifyHeight: number;
  chainID: string;
}

class Network {
  version: string;
  port: number;
  seedPeers: string[];
}

export class NodeInfoDto {
  version: string;
  networkVersion: string;
  chainID: string;
  lastBlockID: string;
  height: number;
  finalizedHeight: number;
  syncing: boolean;
  unconfirmedTransactions: number;
  genesisHeight: number;
  genesis: Genesis;
  network: Network;
  registeredModules: string[];
  moduleCommands: string[];
}

export const getNodeInfoResponse: ApiResponseOptions = {
  status: 200,
  description: 'The node info has been successfully fetched.',
  type: NodeInfoDto,
};
