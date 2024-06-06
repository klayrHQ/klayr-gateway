import { ApiQueryOptions } from '@nestjs/swagger';
import { DEFAULT_BLOCKS_TO_FETCH } from 'src/utils/constants';

enum SortTypes {
  HEIGHT_ASC = 'height:asc',
  HEIGHT_DESC = 'height:desc',
  TIMESTAMP_ASC = 'timestamp:asc',
  TIMESTAMP_DESC = 'timestamp:desc',
}

export const heightQuery: ApiQueryOptions = {
  name: 'height',
  required: false,
  description: 'Filter blocks by height. Format: "height", "start:end", "start:" or ":end".',
};

export const timestampQuery: ApiQueryOptions = {
  name: 'timestamp',
  required: false,
  description: 'Filter blocks by timestamp. Format: "timestamp", "start:end", "start:" or ":end".',
};

export const blockIDQuery: ApiQueryOptions = {
  name: 'blockID',
  required: false,
  description: 'Get block by block ID.',
};

export const sortQuery: ApiQueryOptions = {
  name: 'sort',
  required: false,
  description: 'Sort blocks. Default is "height:asc".',
  enum: SortTypes,
};

export const limitQuery: ApiQueryOptions = {
  name: 'limit',
  required: false,
  description: `Limit the number of blocks fetched. Default is ${DEFAULT_BLOCKS_TO_FETCH}.`,
};

export const offsetQuery: ApiQueryOptions = {
  name: 'offset',
  required: false,
  description: 'Offset for the blocks fetched. Default is 0.',
};

export const includeAssetsQuery: ApiQueryOptions = {
  name: 'includeAssets',
  required: false,
  description: 'Include assets in the blocks fetched. Default is false.',
};

