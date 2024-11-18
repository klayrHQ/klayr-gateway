import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GeneratorQueryDto } from './dto/get-generators.dto';
import {
  GetGeneratorData,
  getGeneratorRes,
  GetGeneratorResDto,
} from './dto/get-generators-res.dto';
import { NodeApiService } from 'src/modules/node-api/node-api.service';
import { GatewayResponse } from 'src/utils/controller-helpers';
import { Prisma } from '@prisma/client';
import { Generator } from 'src/modules/node-api/types';
import { MAX_VALIDATORS_TO_FETCH } from 'src/utils/constants';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@ApiTags('Generators')
@Controller('generators')
export class GeneratorController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getGeneratorRes)
  async getValidator(@Query() query: GeneratorQueryDto): Promise<GetGeneratorResDto> {
    const { search, limit, offset } = query;
    const take = Math.min(limit, MAX_VALIDATORS_TO_FETCH);

    const { list } = this.nodeApi.generatorList;

    let where: Prisma.ValidatorWhereInput = {
      address: {
        in: list.map((generator) => generator.address),
      },
    };

    if (search) {
      where = {
        ...where,
        OR: [
          { account: { name: { contains: search } } },
          { account: { address: { contains: search } } },
          { account: { publicKey: { contains: search } } },
        ],
      };
    }

    const generators = await this.prisma.validator.findMany({
      where,
      take,
      include: {
        account: true,
      },
    });
    const response = generators.map((validator) => this.getGeneratorResponse(validator, list));
    const sortedRes = this.sortResponse(response, take, offset);

    return new GatewayResponse(sortedRes, {
      count: sortedRes.length,
      offset,
      total: list.length,
    });
  }

  private getGeneratorResponse(
    validator: Prisma.ValidatorGetPayload<{ include: { account: true } }>,
    list: Generator[],
  ): GetGeneratorData {
    const {
      account: { address, publicKey, name },
      status,
    } = validator;

    return {
      address,
      name,
      publicKey,
      nextAllocatedTime: Number(list.find((gen) => gen.address === address)?.nextAllocatedTime),
      status,
    };
  }

  private sortResponse(response: GetGeneratorData[], take: number, offset: number) {
    return response
      .sort((a, b) => {
        const timeA = a.nextAllocatedTime ? Number(a.nextAllocatedTime) : 0;
        const timeB = b.nextAllocatedTime ? Number(b.nextAllocatedTime) : 0;

        return timeA - timeB;
      })
      .slice(offset, offset + take);
  }
}
