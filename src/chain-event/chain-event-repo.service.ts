import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChainEventRepoService {
  constructor(private prisma: PrismaService) {}

  public async createEventsBulk(
    events: Prisma.ChainEventsCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.chainEvents.createMany({
      data: events,
    });
  }

  public async countChainEvents(params: { where?: Prisma.ChainEventsWhereInput }): Promise<number> {
    const { where } = params;
    return this.prisma.chainEvents.count({
      where,
    });
  }

  public async getChainEvents(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ChainEventsWhereUniqueInput;
    where?: Prisma.ChainEventsWhereInput;
    orderBy?: Prisma.ChainEventsOrderByWithRelationInput;
  }): Promise<
    Prisma.ChainEventsGetPayload<{
      include: { block: { select: { id: true; height: true; timestamp: true } } };
    }>[]
  > {
    const { skip, take, cursor, where, orderBy } = params;
    return await this.prisma.chainEvents.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        block: {
          select: {
            id: true,
            height: true,
            timestamp: true,
          },
        },
      },
    });
  }
}
