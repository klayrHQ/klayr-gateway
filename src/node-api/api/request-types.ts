import { ApiBodyOptions } from '@nestjs/swagger';

export const invokeNodeApiBody: ApiBodyOptions = {
  description: 'Proxy application endpoint invocations via Klayr Gateway.',
  schema: {
    type: 'object',
    properties: {
      endpoint: { type: 'string', example: 'chain_getBlocksByHeightBetween' },
      params: {
        type: 'object',
        example: { from: 10, to: 15 },
      },
    },
    required: ['endpoint'],
  },
};
