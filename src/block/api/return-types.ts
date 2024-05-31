import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';

export class AggregateCommit {
  @ApiProperty()
  height: number;

  @ApiProperty()
  aggregationBits: string;

  @ApiProperty()
  certificateSignature: string;

  @ApiProperty()
  blockHeight: number;
}

export class Asset {
  @ApiProperty()
  height: number;

  @ApiProperty()
  module: string;

  @ApiProperty()
  data: string;
}

export class GetBlockResponse {
  @ApiProperty()
  height: number;

  @ApiProperty()
  id: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  timestamp: number;

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

  @ApiProperty({ type: () => AggregateCommit })
  aggregateCommit: AggregateCommit;

  @ApiProperty({ type: () => [Asset], required: false })
  assets?: Asset[];
}

export const getBlocksResponse: ApiResponseOptions = {
  status: 200,
  description: 'The blocks have been successfully fetched.',
  type: GetBlockResponse,
  isArray: true,
};
