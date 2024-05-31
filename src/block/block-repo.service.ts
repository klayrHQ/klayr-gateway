import { Injectable } from '@nestjs/common';
import { Block, Prisma, PrismaPromise } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

// TODO: Error handling in here or at calls
@Injectable()
export class BlockRepoService {
  constructor(private prisma: PrismaService) {}

  public async getBlock(
    blockWhereUniqueInput: Prisma.BlockWhereUniqueInput,
  ): Promise<Block | null> {
    return this.prisma.block.findUnique({
      where: blockWhereUniqueInput,
      include: { aggregateCommit: true, assets: true },
    });
  }

  public async getBlocks(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BlockWhereUniqueInput;
    where?: Prisma.BlockWhereInput;
    orderBy?: Prisma.BlockOrderByWithRelationInput;
    includeAssets?: boolean;
  }): Promise<Block[]> {
    const { skip, take, cursor, where, orderBy, includeAssets } = params;
    return this.prisma.block.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        aggregateCommit: {
          select: {
            height: true,
            aggregationBits: true,
            certificateSignature: true,
            blockHeight: true,
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
    });
  }

  public async createBlocksTx(createBlockFunctions: PrismaPromise<Block>[]): Promise<Block[]> {
    return this.prisma.$transaction(createBlockFunctions);
  }

  public createBlocks(createBlockInput: Prisma.BlockCreateInput): PrismaPromise<Block> {
    return this.prisma.block.create({ data: createBlockInput });
  }

  public async updateBlock(params: {
    where: Prisma.BlockWhereUniqueInput;
    data: Prisma.BlockUpdateInput;
  }): Promise<Block> {
    const { data, where } = params;
    return this.prisma.block.update({
      data,
      where,
    });
  }

  public async deleteBlock(where: Prisma.BlockWhereUniqueInput): Promise<Block> {
    return this.prisma.block.delete({
      where,
    });
  }

  // NOT USED for now, tested same speed as createBlocksTx
  public async createAggregateCommitBulk(
    aggregateCommits: Prisma.AggregateCommitCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.aggregateCommit.createMany({
      data: aggregateCommits,
    });
  }

  // NOT USED for now, tested same speed as createBlocksTx
  public async createBlocksBulk(
    blocks: Prisma.BlockCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.block.createMany({
      data: blocks,
    });
  }
}
