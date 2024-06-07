import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetValidatorResponse } from './open-api/return-types';

@Injectable()
export class ValidatorRepoService {
  constructor(private prisma: PrismaService) {}

  public async getValidator(
    validatorWhereUniqueInput: Prisma.ValidatorWhereUniqueInput,
  ): Promise<GetValidatorResponse | null> {
    return this.prisma.validator.findUnique({
      where: validatorWhereUniqueInput,
      select: {
        address: true,
        name: true,
        blsKey: true,
        proofOfPossession: true,
        generatorKey: true,
      },
    });
  }

  public async createValidatorsBulk(
    validators: Prisma.ValidatorCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.validator.createMany({
      data: validators,
    });
  }
}
