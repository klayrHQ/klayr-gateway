import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';

class AggregateCommit {
  @ApiProperty()
  height: number;

  @ApiProperty()
  aggregationBits: string;

  @ApiProperty()
  certificateSignature: string;
}

class Header {
  @ApiProperty()
  version: number;

  @ApiProperty()
  timestamp: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  previousBlockID: string;

  @ApiProperty()
  stateRoot: string;

  @ApiProperty()
  assetRoot: string;

  @ApiProperty()
  eventRoot: string;

  @ApiProperty()
  transactionRoot: string;

  @ApiProperty()
  validatorsHash: string;

  @ApiProperty({ type: AggregateCommit })
  aggregateCommit: AggregateCommit;

  @ApiProperty()
  generatorAddress: string;

  @ApiProperty()
  maxHeightPrevoted: number;

  @ApiProperty()
  maxHeightGenerated: number;

  @ApiProperty()
  impliesMaxPrevotes: boolean;

  @ApiProperty()
  signature: string;

  @ApiProperty()
  id: string;
}

class Asset {
  @ApiProperty()
  module: string;

  @ApiProperty()
  data: string;
}

export class BlockDto {
  @ApiProperty({ type: Header })
  header: Header;

  @ApiProperty({ type: 'array', items: { type: 'string' } })
  transactions: string[];

  @ApiProperty({ type: () => [Asset] })
  assets: Asset[];
}

export const invokeNodeApiResponse: ApiResponseOptions = {
  status: 200,
  description: 'The blocks have been successfully fetched.',
  type: BlockDto,
  isArray: true,
};
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
