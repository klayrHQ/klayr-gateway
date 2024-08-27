import { ApiResponseOptions } from '@nestjs/swagger';
import { Params } from './post-transaction-res.dto';
import { JsonValue } from '@prisma/client/runtime/library';

class Account {
  address: string;
  publicKey?: string;
  name?: string;
}

class Block {
  id: string;
  height: number;
  timestamp: number;
  isFinal: boolean;
}

export class GetTransactionsResDto {
  id: string;
  module: string;
  command: string;
  nonce: string;
  fee: string;
  minFee: string;
  index: number;
  executionStatus: string;
  params: JsonValue | Params;
  signatures: string[];
  sender: Account;
  recipient?: Account;
  block: Block;
}

export const getTransactionsResponse: ApiResponseOptions = {
  status: 200,
  description: 'Transactions has been successfully retrieved.',
  type: GetTransactionsResDto,
};
