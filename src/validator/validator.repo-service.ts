import { Injectable } from '@nestjs/common';
import { Prisma, Validator } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ValidatorRepoService {
  constructor(private prisma: PrismaService) {}

  public async getValidator(
    validatorWhereUniqueInput: Prisma.ValidatorWhereUniqueInput,
  ): Promise<Partial<Validator> | null> {
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
