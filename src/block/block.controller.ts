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
} from './open-api/request-types';
import { GetBlockResponse, getBlocksResponse } from './open-api/return-types';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';

@ApiTags('Blocks')
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
    @Query('height') height: string,
    @Query('timestamp') timestamp: string,
    @Query('blockID') blockID: string,
    @Query('sort', new DefaultValuePipe('height:asc')) sort: string,
    @Query('limit', new DefaultValuePipe(DEFAULT_BLOCKS_TO_FETCH)) limit: number,
    @Query('offset', new DefaultValuePipe(0), new ParseIntPipe()) offset: number,
    @Query('includeAssets', new DefaultValuePipe(false), new ParseBoolPipe())
    includeAssets: boolean,
  ): Promise<GatewayResponse<GetBlockResponse[]>> {
    const { field, direction } = ControllerHelpers.validateSortParameter(sort);
    const take = Math.min(limit, MAX_BLOCKS_TO_FETCH);
    const where = {};

    if (height) {
      const [start, end] = height.split(':');
      where['height'] = ControllerHelpers.buildCondition(start, end, take);
    }

    if (timestamp) {
      const [start, end] = timestamp.split(':');
      where['timestamp'] = ControllerHelpers.buildCondition(start, end, take);
    }

    if (blockID) {
      where['id'] = blockID;
    }

    const [blocks, total] = await Promise.all([
      this.blockRepoService.getBlocks({
        where,
        take,
        orderBy: {
          [field]: direction,
        },
        skip: offset,
        includeAssets,
      }),
      this.blockRepoService.countBlocks({}),
    ]);

    blocks.forEach((block) => {
      block.aggregateCommit = JSON.parse(block.aggregateCommit);
      if (!block.generator.publicKey) delete block.generator.publicKey;
      if (!block.generator.name) delete block.generator.name;
      delete block.generatorAddress;
    });

    return new GatewayResponse(blocks, { count: blocks.length, offset, total });
  }
}
