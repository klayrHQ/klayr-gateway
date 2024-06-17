import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetValidatorResponseDto } from './dto/get-validator-res.dto';

@Injectable()
export class ValidatorRepoService {
  constructor(private prisma: PrismaService) {}

  public async getValidator(
    validatorWhereUniqueInput: Prisma.ValidatorWhereUniqueInput,
  ): Promise<GetValidatorResponseDto | null> {
    return this.prisma.validator.findUnique({
      where: validatorWhereUniqueInput,
      select: {
        account: true,
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
