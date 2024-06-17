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

export class InvokeBlockDto {
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
  type: InvokeBlockDto,
  isArray: true,
};
