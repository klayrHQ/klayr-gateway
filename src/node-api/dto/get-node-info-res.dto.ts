import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';

class GenesisBlock {
  @ApiProperty()
  fromFile: string;
}

class Genesis {
  @ApiProperty({ type: GenesisBlock })
  block: GenesisBlock;

  @ApiProperty()
  blockTime: number;

  @ApiProperty()
  bftBatchSize: number;

  @ApiProperty()
  maxTransactionsSize: number;

  @ApiProperty()
  minimumCertifyHeight: number;

  @ApiProperty()
  chainID: string;
}

class Network {
  @ApiProperty()
  version: string;

  @ApiProperty()
  port: number;

  @ApiProperty({ type: 'array', items: { type: 'string' } })
  seedPeers: string[];
}

export class NodeInfoDto {
  @ApiProperty()
  version: string;

  @ApiProperty()
  networkVersion: string;

  @ApiProperty()
  chainID: string;

  @ApiProperty()
  lastBlockID: string;

  @ApiProperty()
  height: number;

  @ApiProperty()
  finalizedHeight: number;

  @ApiProperty()
  syncing: boolean;

  @ApiProperty()
  unconfirmedTransactions: number;

  @ApiProperty()
  genesisHeight: number;

  @ApiProperty({ type: Genesis })
  genesis: Genesis;

  @ApiProperty({ type: Network })
  network: Network;
}

export const getNodeInfoResponse: ApiResponseOptions = {
  status: 200,
  description: 'The node info has been successfully fetched.',
  type: NodeInfoDto,
};
