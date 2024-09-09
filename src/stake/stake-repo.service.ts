import { Injectable } from '@nestjs/common';
import { Prisma, Stake } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StakeRepoService {
  constructor(private prisma: PrismaService) {}

  public async createStakesBulk(
    stakes: Prisma.StakeCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.stake.createMany({
      data: stakes,
    });
  }

  public async createStake(stake: Prisma.StakeCreateInput): Promise<Stake> {
    return this.prisma.stake.create({
      data: stake,
    });
  }

  public async deleteManyStakes(where: Prisma.StakeWhereInput): Promise<Prisma.BatchPayload> {
    return this.prisma.stake.deleteMany({
      where,
    });
  }

  public async getStakes(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.StakeWhereUniqueInput;
    where?: Prisma.StakeWhereInput;
    orderBy?: Prisma.StakeOrderByWithRelationInput;
  }): Promise<
    Prisma.StakeGetPayload<{
      include: {
        account: true;
      };
    }>[]
  > {
    const { skip, take, cursor, where, orderBy } = params;
    return await this.prisma.stake.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        account: true,
      },
    });
  }
}
