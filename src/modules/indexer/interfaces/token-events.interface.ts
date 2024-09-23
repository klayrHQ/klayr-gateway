export interface TokenTransferEvent {
  senderAddress: string;
  recipientAddress: string;
  tokenID: string;
  amount: string;
  result: number;
}

export interface TokenLockEvent {
  address: string;
  module: string;
  tokenID: string;
  amount: string;
  result: number;
}

export interface TokenUnlockEvent {
  address: string;
  module: string;
  tokenID: string;
  amount: string;
  result: number;
}

export interface TokenBurnEvent {
  address: string;
  tokenID: string;
  amount: string;
  result: number;
}

export interface TokenMintEvent {
  address: string;
  tokenID: string;
  amount: string;
  result: number;
}
