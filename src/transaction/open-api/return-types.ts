import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';

export class PostTransactionResponse {
  @ApiProperty()
  transactionID: string;
}

export const postTransactionResponse: ApiResponseOptions = {
  status: 200,
  description: 'Transaction has been successfully posted.',
  type: PostTransactionResponse,
};

export class Params {
  @ApiProperty()
  tokenID: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  recipient: string;

  @ApiProperty()
  data: string;
}

class Sender {
  @ApiProperty()
  address: string;

  @ApiProperty()
  publicKey?: string;

  @ApiProperty()
  name?: string;
}

class Block {
  @ApiProperty()
  id: string;

  @ApiProperty()
  height: number;

  @ApiProperty()
  timestamp: number;

  @ApiProperty()
  isFinal: boolean;
}

export class GetTransactions {
  @ApiProperty()
  id: string;

  @ApiProperty()
  senderAddress: string;

  @ApiProperty()
  module: string;

  @ApiProperty()
  command: string;

  @ApiProperty()
  nonce: string;

  @ApiProperty()
  fee: string;

  @ApiProperty()
  minFee: string;

  // @ApiProperty()
  // timestamp: number;

  @ApiProperty({ type: Params })
  params: string | Params;

  @ApiProperty({ type: 'string', isArray: true })
  signatures: string | string[];

  @ApiProperty({ type: Sender })
  sender: Sender;

  @ApiProperty({ type: Block })
  block: Block;
}

export const getTransactionsResponse: ApiResponseOptions = {
  status: 200,
  description: 'Transactions has been successfully retrieved.',
  type: GetTransactions,
};
