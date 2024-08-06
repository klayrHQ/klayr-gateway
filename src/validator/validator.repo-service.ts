import { Injectable } from '@nestjs/common';
import { Prisma, Validator } from '@prisma/client';
import { DbCacheService } from 'src/db-cache/db-cache.service';
import { Models } from 'src/db-cache/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { StateService } from 'src/state/state.service';
import { IndexerState, Modules } from 'src/state/types';

@Injectable()
export class ValidatorRepoService {
  constructor(
    private prisma: PrismaService,
    private state: StateService,
    private dbCache: DbCacheService,
  ) {}

  public async getValidator(
    validatorWhereUniqueInput: Prisma.ValidatorWhereUniqueInput,
  ): Promise<Validator | null> {
    return this.prisma.validator.findUnique({
      where: validatorWhereUniqueInput,
      include: {
        account: true,
      },
    });
  }

  public async getValidators(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ValidatorWhereUniqueInput;
    where?: Prisma.ValidatorWhereInput;
    orderBy?: Prisma.ValidatorOrderByWithRelationInput;
  }): Promise<
    Prisma.ValidatorGetPayload<{
      include: {
        account: true;
      };
    }>[]
  > {
    const { skip, take, cursor, where, orderBy } = params;
    return await this.prisma.validator.findMany({
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

  public async countValidators(params: { where?: Prisma.ValidatorWhereInput }): Promise<number> {
    const { where } = params;
    return this.prisma.validator.count({
      where,
    });
  }

  public async countBlocks(params: { where?: Prisma.BlockWhereInput }): Promise<number> {
    const { where } = params;
    return this.prisma.block.count({
      where,
    });
  }

  public async createValidatorsBulk(
    validators: Prisma.ValidatorCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.validator.createMany({
      data: validators,
    });
  }

  public async createValidator(validator: Prisma.ValidatorCreateInput): Promise<Validator> {
    return this.prisma.validator.create({
      data: validator,
    });
  }

  public async updateValidator(params: {
    where: Prisma.ValidatorWhereUniqueInput;
    data: Prisma.ValidatorUpdateInput;
  }): Promise<void> {
    const { where, data } = params;
    if (this.state.get(Modules.INDEXER) === IndexerState.INDEXING) {
      await this.prisma.validator.update({
        where,
        data,
      });
    } else {
      await this.dbCache.add({
        where,
        data,
        model: Models.VALIDATOR,
      });
    }
  }

  public async getAllValidators(): Promise<Validator[]> {
    return this.prisma.validator.findMany({
      orderBy: {
        validatorWeight: 'desc',
      },
    });
  }
}
