import { BadRequestException } from '@nestjs/common';

export class ControllerHelpers {
  static buildCondition(start: string, end: string, take: number) {
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
        gt: Number(end) - take,
        lte: Number(end),
      };
    }
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
