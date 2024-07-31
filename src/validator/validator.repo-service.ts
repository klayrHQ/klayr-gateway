import { Injectable } from '@nestjs/common';
import { Prisma, Validator } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ValidatorRepoService {
  constructor(private prisma: PrismaService) {}

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

  public async createValidator(validator: Prisma.ValidatorCreateInput): Promise<Validator> {
    return this.prisma.validator.create({
      data: validator,
    });
  }

  public async createValidatorsBulk(validators: Prisma.ValidatorCreateManyInput[]): Promise<void> {
    await this.prisma.pushToDbQ({
      method: 'executeCreateValidatorsBulk',
      params: [validators],
    });
  }

  public async updateValidator(
    validatorWhereUniqueInput: Prisma.ValidatorWhereUniqueInput,
    validatorUpdateInput: Prisma.ValidatorUpdateInput,
  ): Promise<void> {
    await this.prisma.pushToDbQ({
      method: 'executeUpdateValidator',
      params: [validatorWhereUniqueInput, validatorUpdateInput],
    });
  }

  public async getAllValidators(): Promise<Validator[]> {
    return this.prisma.validator.findMany({
      orderBy: {
        validatorWeight: 'desc',
      },
    });
  }
}
