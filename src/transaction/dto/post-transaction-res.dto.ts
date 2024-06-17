import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';

export class PostTransactionResponseDto {
  @ApiProperty()
  transactionID: string;
}

export const postTransactionResponse: ApiResponseOptions = {
  status: 200,
  description: 'Transaction has been successfully posted.',
  type: PostTransactionResponseDto,
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
