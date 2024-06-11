import { ApiBodyOptions, ApiQueryOptions } from '@nestjs/swagger';
import { DEFAULT_TX_TO_FETCH } from 'src/utils/constants';
import { SortTypes } from 'src/utils/controller-helpers';

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

export const transactionIDQuery: ApiQueryOptions = {
  name: 'transactionID',
  type: 'string',
  required: false,
  description: 'Get transaction by transaction ID.',
};

export const senderAddressQuery: ApiQueryOptions = {
  name: 'senderAddress',
  type: 'string',
  required: false,
  description: 'Filter transactions by sender address.',
};

export const nonceQuery: ApiQueryOptions = {
  name: 'nonce',
  type: 'number',
  required: false,
  description: 'Filter transactions by nonce.',
};

export const addressQuery: ApiQueryOptions = {
  name: 'address',
  type: 'string',
  required: false,
  description: 'Filter transactions by address.',
};

export const moduleCommandQuery: ApiQueryOptions = {
  name: 'moduleCommand',
  type: 'string',
  required: false,
  description: 'Filter transactions by module and command. Format: "module:command".',
};

export const limitQuery: ApiQueryOptions = {
  name: 'limit',
  type: 'string',
  required: false,
  description: `Limit the number of transactions fetched. Default is ${DEFAULT_TX_TO_FETCH}.`,
};

export const blockIDQuery: ApiQueryOptions = {
  name: 'blockID',
  type: 'string',
  required: false,
  description: 'Filter transactions by block ID.',
};

export const heightQuery: ApiQueryOptions = {
  name: 'height',
  type: 'string',
  required: false,
  description: 'Filter transactions by height. Format: "height", "start:end", "start:" or ":end".',
};

export const timestampQuery: ApiQueryOptions = {
  name: 'timestamp',
  type: 'string',
  required: false,
  description:
    'Filter transactions by timestamp. Format: "timestamp", "start:end", "start:" or ":end".',
};

export const sortQuery: ApiQueryOptions = {
  name: 'sort',
  type: 'string',
  required: false,
  description: 'Sort transactions. Default is "height:asc".',
  enum: SortTypes,
};

export const offsetQuery: ApiQueryOptions = {
  name: 'offset',
  type: 'string',
  required: false,
  description: 'Offset for the transactions fetched. Default is 0.',
};
