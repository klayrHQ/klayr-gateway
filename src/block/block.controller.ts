import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { BlockRepoService } from './block-repo.service';
import { MAX_BLOCKS_TO_FETCH } from 'src/utils/constants';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetBlockResDto, getBlocksResponse } from './dto/get-blocks-res.dto';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import { Prisma } from '@prisma/client';
import { GetBlocksDto } from './dto/get-blocks.dto';

@ApiTags('Blocks')
@Controller('blocks')
export class BlockController {
  constructor(private readonly blockRepoService: BlockRepoService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getBlocksResponse)
  async getBlocks(@Query() query: GetBlocksDto): Promise<GatewayResponse<GetBlockResDto[]>> {
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

    const blockResponse: GetBlockResDto[] = blocks.map((block) => this.toGetBlockResponse(block));

    return new GatewayResponse(blockResponse, { count: blocks.length, offset, total });
  }

  private toGetBlockResponse(
    block: Prisma.BlockGetPayload<{ include: { generator: true } }>,
  ): GetBlockResDto {
    const { generator, ...rest } = block;
    const newBlock: GetBlockResDto = {
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
