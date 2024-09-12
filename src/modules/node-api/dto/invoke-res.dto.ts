import { ApiResponseOptions } from '@nestjs/swagger';

class AggregateCommit {
  height: number;
  aggregationBits: string;
  certificateSignature: string;
}

class Header {
  version: number;
  timestamp: number;
  height: number;
  previousBlockID: string;
  stateRoot: string;
  assetRoot: string;
  eventRoot: string;
  transactionRoot: string;
  validatorsHash: string;
  aggregateCommit: AggregateCommit;
  generatorAddress: string;
  maxHeightPrevoted: number;
  maxHeightGenerated: number;
  impliesMaxPrevotes: boolean;
  signature: string;
  id: string;
}

class Asset {
  module: string;
  data: string;
}

export class InvokeBlockDto {
  header: Header;
  transactions: string[];
  assets: Asset[];
}

export const invokeNodeApiResponse: ApiResponseOptions = {
  status: 200,
  description: 'The blocks have been successfully fetched.',
  type: InvokeBlockDto,
  isArray: true,
};
