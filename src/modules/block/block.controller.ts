import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { MAX_BLOCKS_TO_FETCH } from 'src/utils/constants';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetBlockResDto, getBlocksResponse } from './dto/get-blocks-res.dto';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import { Prisma } from '@prisma/client';
import { GetBlocksDto } from './dto/get-blocks.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@ApiTags('Blocks')
@Controller('blocks')
export class BlockController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getBlocksResponse)
  async getBlocks(@Query() query: GetBlocksDto): Promise<GatewayResponse<GetBlockResDto[]>> {
    const { blockID, height, timestamp, sort, limit, offset, includeAssets, generatorAddress } =
      query;
    const { field, direction } = ControllerHelpers.validateSortParameter(sort);
    const take = Math.min(limit, MAX_BLOCKS_TO_FETCH);

    const where: Prisma.BlockWhereInput = {
      ...(blockID && { id: blockID }),
      ...(height && { height: ControllerHelpers.buildRangeCondition(height) }),
      ...(timestamp && { timestamp: ControllerHelpers.buildRangeCondition(timestamp) }),
      ...(generatorAddress && { generatorAddress }),
      height: { not: 0 }, // Exclude genesis block be default
    };

    const [blocks, total] = await Promise.all([
      this.prisma.block.findMany({
        where,
        take,
        orderBy: {
          [field]: direction,
        },
        skip: offset,
        include: {
          generator: {
            select: {
              address: true,
              publicKey: true,
              nonce: true,
              name: true,
            },
          },

          assets: includeAssets
            ? {
                select: {
                  height: true,
                  module: true,
                  data: true,
                },
              }
            : false,
        },
      }),
      this.prisma.block.count({ where }),
    ]);

    const blockResponse: GetBlockResDto[] = blocks.map((block) => this.toGetBlockResponse(block));

    return new GatewayResponse(blockResponse, { count: blocks.length, offset, total });
  }

  private toGetBlockResponse(
    block: Prisma.BlockGetPayload<{
      include: {
        generator: { select: { address: true; publicKey: true; nonce: true; name: true } };
      };
    }>,
  ): GetBlockResDto {
    const { generator, ...rest } = block;
    const newBlock: GetBlockResDto = {
      ...rest,
      generator: generator,
      totalBurnt: block.totalBurnt.toString(),
      networkFee: block.networkFee.toString(),
      totalForged: block.totalForged.toString(),
      aggregateCommit: JSON.parse(block.aggregateCommit),
      generatorAddress: undefined,
    };
    if (!generator.publicKey) delete generator.publicKey;
    if (!generator.name) delete generator.name;
    if (newBlock.assets) {
      newBlock.assets.forEach((asset) => {
        asset.data = JSON.parse(asset.data) ?? asset.data;
      });
    }
    return newBlock;
  }
}