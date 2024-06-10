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

  public async countBlocks(where: Prisma.BlockWhereInput): Promise<number> {
    return this.prisma.block.count({ where });
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
}
