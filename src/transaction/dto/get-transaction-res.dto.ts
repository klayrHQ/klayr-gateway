import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';
import { Params } from './post-transaction-res.dto';

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

export class GetTransactionsResDto {
  @ApiProperty()
  id: string;

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

  @ApiProperty()
  index: number;

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
  type: GetTransactionsResDto,
};
