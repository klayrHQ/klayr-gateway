import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';

export class PostTransactionResponseDto {
  transactionID: string;
}

export const postTransactionResponse: ApiResponseOptions = {
  status: 200,
  description: 'Transaction has been successfully posted.',
  type: PostTransactionResponseDto,
};

export class Params {
  tokenID: string;
  amount: string;
  recipient: string;
  data: string;
}
