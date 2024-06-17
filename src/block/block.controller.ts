import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { BlockRepoService } from './block-repo.service';
import { MAX_BLOCKS_TO_FETCH } from 'src/utils/constants';
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
import { GetBlockRes, getBlocksResponse } from './open-api/return-types';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import { Prisma } from '@prisma/client';
import { GetBlocksDto } from './dto/get-blocks.dto';

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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getBlocksResponse)
  async getBlocks(@Query() query: GetBlocksDto): Promise<GatewayResponse<GetBlockRes[]>> {
    const { blockID, height, timestamp, sort, limit, offset, includeAssets } = query;
    const { field, direction } = ControllerHelpers.validateSortParameter(sort);
    const take = Math.min(limit, MAX_BLOCKS_TO_FETCH);

    const where: Prisma.BlockWhereInput = {
      ...(blockID && { id: blockID }),
      ...(height && { height: ControllerHelpers.buildRangeCondition(height) }),
      ...(timestamp && { timestamp: ControllerHelpers.buildRangeCondition(timestamp) }),
    };

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
      this.blockRepoService.countBlocks({ where }),
    ]);

    const blockResponse: GetBlockRes[] = blocks.map((block) => this.toGetBlockResponse(block));

    return new GatewayResponse(blockResponse, { count: blocks.length, offset, total });
  }

  private toGetBlockResponse(
    block: Prisma.BlockGetPayload<{ include: { generator: true } }>,
  ): GetBlockRes {
    const { generator, ...rest } = block;
    const newBlock: GetBlockRes = {
      ...rest,
      totalBurnt: block.totalBurnt.toString(),
      networkFee: block.networkFee.toString(),
      totalForged: block.totalForged.toString(),
      aggregateCommit: JSON.parse(block.aggregateCommit),
      generatorAddress: undefined,
    };
    if (!generator.publicKey) delete generator.publicKey;
    if (!generator.name) delete generator.name;
    return newBlock;
  }
}
