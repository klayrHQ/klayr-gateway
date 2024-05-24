import { Injectable } from '@nestjs/common';
import { Block, Prisma, PrismaPromise } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BlockRepoService {
  constructor(private prisma: PrismaService) {}

  public async getBlock(
    blockWhereUniqueInput: Prisma.BlockWhereUniqueInput,
  ): Promise<Block | null> {
    console.log(blockWhereUniqueInput);
    return this.prisma.block.findUnique({
      where: blockWhereUniqueInput,
      include: { aggregateCommit: true },
    });
  }

  public async getBlocks(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BlockWhereUniqueInput;
    where?: Prisma.BlockWhereInput;
    orderBy?: Prisma.BlockOrderByWithRelationInput;
  }): Promise<Block[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.block.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  // TODO: Combine functions?
  public async createBlocks(createBlockPromises: any[]): Promise<Block[]> {
    return this.prisma.$transaction(createBlockPromises);
  }

  // TODO: Combine functions?
  public createBlockPromises(createBlockInput: Prisma.BlockCreateInput): PrismaPromise<Block> {
    return this.prisma.block.create({ data: createBlockInput });
  }

  public async createBlock(createBlockInput: Prisma.BlockCreateInput): Promise<Block> {
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
}
