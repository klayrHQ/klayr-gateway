import { BadRequestException } from '@nestjs/common';
import { NodeApiError } from 'src/modules/node-api/types';

export class ControllerHelpers {
  static isNodeApiError(response: any): response is NodeApiError {
    return (response as NodeApiError).error !== undefined;
  }
  static buildRangeCondition(value: string): Record<string, any> {
    if (!value) {
      return {};
    }

    const [start, end] = value.split(':');
    return this.buildCondition(start, end);
  }

  static buildCondition(start: string, end: string) {
    if (start && end) {
      return {
        gte: Number(start),
        lte: Number(end),
      };
    } else if (start) {
      return {
        gte: Number(start),
      };
    } else if (end) {
      return {
        lte: Number(end),
      };
    }

    return {};
  }

  static validateSortParameter(sort: string) {
    const [field, direction] = sort.split(':');
    if (
      !['height', 'timestamp'].includes(field) ||
      !['asc', 'desc'].includes(direction.toLowerCase())
    ) {
      throw new BadRequestException(
        'Invalid sort parameter. It should be one of "height:asc", "height:desc", "timestamp:asc", "timestamp:desc".',
      );
    }
    return { field, direction };
  }
}

export class GatewayResponse<T, U = object> {
  constructor(
    public data: T,
    public meta: U,
  ) {}
}

export enum SortTypes {
  HEIGHT_ASC = 'height:asc',
  HEIGHT_DESC = 'height:desc',
  TIMESTAMP_ASC = 'timestamp:asc',
  TIMESTAMP_DESC = 'timestamp:desc',
}

export enum ValidatorSortTypes {
  COMMISSION_ASC = 'commission:asc',
  COMMISSION_DESC = 'commission:desc',
  VALIDATOR_WEIGHT_DESC = 'validatorWeight:desc',
  VALIDATOR_WEIGHT_ASC = 'validatorWeight:asc',
  RANK_ASC = 'rank:asc',
  RANK_DESC = 'rank:desc',
  NAME_ASC = 'name:asc',
  NAME_DESC = 'name:desc',
  GENERATED_BLOCKS_ASC = 'generatedBlocks:asc',
  GENERATED_BLOCKS_DESC = 'generatedBlocks:desc',
  SELF_STAKE_ASC = 'selfStake:asc',
  SELF_STAKE_DESC = 'selfStake:desc',
  NEXT_ALLOCATED_TIME_ASC = 'nextAllocatedTime:asc',
  NEXT_ALLOCATED_TIME_DESC = 'nextAllocatedTime:desc',
}

export enum AccountSortTypes {
  TOTAL_BALANCE_ASC = 'totalBalance:asc',
  TOTAL_BALANCE_DESC = 'totalBalance:desc',
}

export enum AvailableIdsSortTypes {
  TOKEN_ID_ASC = 'tokenID:asc',
  TOKEN_ID_DESC = 'tokenID:desc',
}

export enum BlockchainAppsMetaSortTypes {
  CHAIN_NAME_ASC = 'chainName:asc',
  CHAIN_NAME_DESC = 'chainName:desc',
  CHAIN_ID_ASC = 'chainID:asc',
  CHAIN_ID_DESC = 'chainID:desc',
}

export enum BlockChainTokensSortTypes {
  TOKEN_ID_ASC = 'tokenID:asc',
  TOKEN_ID_DESC = 'tokenID:desc',
}

export enum BlockchainAppsMetaListTypes {
  CHAIN_NAME_ASC = 'chainName:asc',
  CHAIN_NAME_DESC = 'chainName:desc',
}
