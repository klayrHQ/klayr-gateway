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
