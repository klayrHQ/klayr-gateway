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

export class GetTransactionsData {
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
  receivingChainID?: string;
  block: Block;
}

export class GetTransactionsMeta {
  count: number;
  offset: number;
  total: number;
}

export class GetTransactionsResDto {
  data: GetTransactionsData[];
  meta: GetTransactionsMeta;
}

export const getTransactionsResponse: ApiResponseOptions = {
  status: 200,
  description: 'Transactions has been successfully retrieved.',
  type: GetTransactionsResDto,
};
