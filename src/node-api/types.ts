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
  aggregateCommit: {
    height: number;
    aggregationBits: string;
    certificateSignature: string;
  };
  generatorAddress: string;
  maxHeightPrevoted: number;
  maxHeightGenerated: number;
  impliesMaxPrevotes: boolean;
  signature: string;
  id: string;
}

export interface Block {
  header: BlockHeader;
  transactions?: any[]; // TODO
  assets?: any[]; // TODO
}
export interface NewBlockEvent {
  [key: string]: BlockHeader;
}

export interface NodeInfo {
  height: number;
  genesisHeight: number;
  [key: string]: unknown;
}
