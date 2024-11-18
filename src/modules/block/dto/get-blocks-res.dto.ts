import { ApiResponseOptions } from '@nestjs/swagger';

export class AggregateCommit {
  height: number;
  aggregationBits: string;
  certificateSignature: string;
}

export class Asset {
  height: number;
  module: string;
  data: string;
}

export class Generator {
  address: string;
  publicKey: string;
  name: string;
}

export class GetBlockData {
  height: number;
  id: string;
  generator: Generator;
  version: number;
  timestamp: number;
  previousBlockID: string;
  stateRoot: string;
  assetRoot: string;
  eventRoot: string;
  transactionRoot: string;
  validatorsHash: string;
  generatorAddress: string;
  maxHeightPrevoted: number;
  maxHeightGenerated: number;
  impliesMaxPrevotes: boolean;
  signature: string;
  aggregateCommit: string | AggregateCommit; // to satisfy the JSON.parse() in the controller
  numberOfTransactions: number;
  numberOfAssets: number;
  numberOfEvents: number;
  reward: string;
  isFinal: boolean;
  totalBurnt: string;
  networkFee: string;
  totalForged: string;
  assets?: Asset[];
}

export class GetBlockMeta {
  count: number;
  offset: number;
  total: number;
}

export class GetBlockResDto {
  data: GetBlockData[];
  meta: GetBlockMeta;
}

export const getBlocksResponse: ApiResponseOptions = {
  status: 200,
  description: 'The blocks have been successfully fetched.',
  type: GetBlockResDto,
};
