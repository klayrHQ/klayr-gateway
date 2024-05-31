import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { BlockRepoService } from './block-repo.service';
import { Block } from '@prisma/client';
import { DEFAULT_BLOCKS_TO_FETCH, MAX_BLOCKS_TO_FETCH } from 'src/utils/constants';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  blockIDQuery,
  heightQuery,
  includeAssetsQuery,
  limitQuery,
  offsetQuery,
  sortQuery,
  timestampQuery,
} from './api/request-types';
import { getBlocksResponse } from './api/return-types';

@ApiTags('blocks')
@Controller('blocks')
export class BlockController {
  constructor(private readonly blockRepoService: BlockRepoService) {}

  @Get()
  @ApiQuery(heightQuery)
  @ApiQuery(timestampQuery)
  @ApiQuery(blockIDQuery)
  @ApiQuery(sortQuery)
  @ApiQuery(limitQuery)
  @ApiQuery(offsetQuery)
  @ApiQuery(includeAssetsQuery)
  @ApiResponse(getBlocksResponse)
  async getBlocks(
    // TODO: Module name query???
    @Query('height') height: string,
    @Query('timestamp') timestamp: string,
    @Query('blockID') blockID: string,
    @Query('sort', new DefaultValuePipe('height:asc')) sort: string,
    @Query('limit', new DefaultValuePipe(DEFAULT_BLOCKS_TO_FETCH)) limit: number,
    @Query('offset', new DefaultValuePipe(0), new ParseIntPipe()) offset: number,
    @Query('includeAssets', new DefaultValuePipe(false), new ParseBoolPipe())
    includeAssets: boolean,
  ): Promise<Block[]> {
    const { field, direction } = this.validateSortParameter(sort);
    const take = Math.min(limit, MAX_BLOCKS_TO_FETCH);
    const where = {};

    if (height) {
      const [start, end] = height.split(':');
      where['height'] = this.buildCondition(start, end, take);
    }

    if (timestamp) {
      const [start, end] = timestamp.split(':');
      where['timestamp'] = this.buildCondition(start, end, take);
    }

    if (blockID) {
      where['id'] = blockID;
    }

    return this.blockRepoService.getBlocks({
      where,
      take,
      orderBy: {
        [field]: direction,
      },
      skip: offset,
      includeAssets,
    });
  }

  private buildCondition(start: string, end: string, take: number) {
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

  private validateSortParameter(sort: string) {
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
