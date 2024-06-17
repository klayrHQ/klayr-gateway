import { ApiResponseOptions } from '@nestjs/swagger';
import { Params } from './post-transaction-res.dto';

class Sender {
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
  params: string | Params;
  signatures: string[];
  sender: Sender;
  block: Block;
}

export const getTransactionsResponse: ApiResponseOptions = {
  status: 200,
  description: 'Transactions has been successfully retrieved.',
  type: GetTransactionsResDto,
};
