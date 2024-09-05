export interface Block {
  header: BlockHeader;
  transactions: Transaction[];
  assets: Asset[];
}

export interface BlockHeader {
  version: number;
  timestamp: number;
  height: number;
  previousBlockID: string;
  stateRoot: string;
  assetRoot: string;
  eventRoot: string;
  transactionRoot: string;
  validatorsHash: string;
  aggregateCommit:
    | {
        height: number;
        aggregationBits: string;
        certificateSignature: string;
      }
    | string;
  generatorAddress: string;
  maxHeightPrevoted: number;
  maxHeightGenerated: number;
  impliesMaxPrevotes: boolean;
  signature: string;
  id: string;
  isFinal?: boolean;
}

export interface Transaction {
  id: string;
  module: string;
  command: string;
  params: string;
  nonce: string;
  fee: string;
  senderPublicKey: string;
  signatures: string[];
  decodedParams?: unknown;
}

export interface Asset {
  height?: number;
  module: string;
  data: string;
}

export interface ProcessedBlockHeader extends BlockHeader {
  aggregateCommit: string;
  reward: string;
  numberOfTransactions: number;
  numberOfAssets: number;
  numberOfEvents: number;
  totalForged: number;
}
