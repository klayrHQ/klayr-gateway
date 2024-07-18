import { Injectable } from '@nestjs/common';
import { Prisma, Validator } from '@prisma/client';
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
      include: {
        account: true,
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

  public async createValidator(validator: Prisma.ValidatorCreateInput): Promise<Validator> {
    return this.prisma.validator.create({
      data: validator,
    });
  }

  public async updateValidator(
    validatorWhereUniqueInput: Prisma.ValidatorWhereUniqueInput,
    validatorUpdateInput: Prisma.ValidatorUpdateInput,
  ): Promise<Validator | null> {
    return this.prisma.validator.update({
      where: validatorWhereUniqueInput,
      data: validatorUpdateInput,
    });
  }
}
