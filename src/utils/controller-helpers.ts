import { BadRequestException } from '@nestjs/common';

export class ControllerHelpers {
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

export class GatewayResponse<T> {
  constructor(
    public data: T,
    public meta: object,
  ) {}
}

export enum SortTypes {
  HEIGHT_ASC = 'height:asc',
  HEIGHT_DESC = 'height:desc',
  TIMESTAMP_ASC = 'timestamp:asc',
  TIMESTAMP_DESC = 'timestamp:desc',
}
