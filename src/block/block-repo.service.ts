import { Injectable } from '@nestjs/common';
import { Block, Prisma, PrismaPromise } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BlockRepoService {
  constructor(private prisma: PrismaService) {}

  public async getBlock(
    blockWhereUniqueInput: Prisma.BlockWhereUniqueInput,
  ): Promise<Block | null> {
    return this.prisma.block.findUnique({
      where: blockWhereUniqueInput,
      include: {
        assets: true,
        generator: {
          select: {
            address: true,
          },
        },
      },
    });
  }

  public async countBlocks(params: { where?: Prisma.BlockWhereInput }): Promise<number> {
    const { where } = params;
    return this.prisma.block.count({
      where,
    });
  }

  public async getBlocks(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BlockWhereUniqueInput;
    where?: Prisma.BlockWhereInput;
    orderBy?: Prisma.BlockOrderByWithRelationInput;
    includeAssets?: boolean;
  }): Promise<Prisma.BlockGetPayload<{ include: { generator: true } }>[]> {
    const { skip, take, cursor, where, orderBy, includeAssets } = params;
    return await this.prisma.block.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        generator: {
          select: {
            address: true,
            publicKey: true,
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
    });
  }

  public createBlock(createBlockInput: Prisma.BlockCreateInput): PrismaPromise<Block> {
    return this.prisma.block.create({ data: createBlockInput });
  }

  public async updateManyBlocks(params: {
    where: Prisma.BlockWhereInput;
    data: Prisma.BlockUpdateManyMutationInput;
  }): Promise<Prisma.BatchPayload> {
    const { data, where } = params;
    return this.prisma.block.updateMany({
      data,
      where,
    });
  }

  public async deleteBlock(where: Prisma.BlockWhereUniqueInput): Promise<Block> {
    return this.prisma.block.delete({
      where,
    });
  }

  public async createBlocksBulk(
    blocks: Prisma.BlockCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.block.createMany({
      data: blocks,
    });
  }

  public async updateBlocksTransaction(updates: PrismaPromise<Block>[]): Promise<Block[]> {
    return this.prisma.$transaction(updates);
  }

  public async updateBlock(params: {
    where: Prisma.BlockWhereUniqueInput;
    data: Prisma.BlockUpdateInput;
  }): Promise<void> {
    const { where, data } = params;
    await this.prisma.block.update({
      where,
      data,
    });
  }

  public async searchBlocks(search: string): Promise<{ id: string; height: number }[]> {
    const height = Number(search);
    const where: Prisma.BlockWhereInput = {
      OR: [{ id: { equals: search } }],
    };

    if (!isNaN(height)) {
      where.OR.push({ height: { equals: height } });
    }

    const blocks = await this.prisma.block.findMany({
      where,
      select: {
        id: true,
        height: true,
      },
    });

    return blocks;
  }
}
