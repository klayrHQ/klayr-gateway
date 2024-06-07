import { ApiBodyOptions } from '@nestjs/swagger';

export const transactionBody: ApiBodyOptions = {
  description: 'signed transaction string',
  schema: {
    type: 'object',
    properties: {
      transaction: { type: 'string', example: '01234abcd' },
    },
    required: ['transaction'],
  },
};
