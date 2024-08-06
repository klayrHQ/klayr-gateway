import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ValidatorRepoService } from './validator.repo-service';
import { GetValidatorResponseDto, getValidatorResponse } from './dto/get-validator-res.dto';
import { GatewayResponse } from 'src/utils/controller-helpers';
import { ValidatorQueryDto } from './dto/get-validator.dto';
import { MAX_VALIDATORS_TO_FETCH, NEXT_VALIDATORS_META } from 'src/utils/constants';
import { Prisma } from '@prisma/client';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Generator, GeneratorList, ValidatorInfo } from 'src/node-api/types';

@ApiTags('Validators')
@Controller('pos')
export class ValidatorController {
  constructor(
    private readonly validatorRepoService: ValidatorRepoService,
    private readonly nodeApiService: NodeApiService,
  ) {}

  @Get('validators')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getValidatorResponse)
  async getValidator(
    @Query() query: ValidatorQueryDto,
  ): Promise<GatewayResponse<GetValidatorResponseDto[]>> {
    const { address, publicKey, name, status, limit, offset, sort } = query;
    const [field, direction] = sort.split(':');
    const take = Math.min(limit, MAX_VALIDATORS_TO_FETCH);

    const where: Prisma.ValidatorWhereInput = {
      ...(address && { address }),
      ...(publicKey && { account: { publicKey } }),
      ...(name && { account: { name } }),
      ...(status && { status }),
    };

    const [validators, total] = await Promise.all([
      this.validatorRepoService.getValidators({
        where,
        take,
        orderBy: {
          [field]: direction,
        },
        skip: offset,
      }),
      this.validatorRepoService.countValidators({ where }),
    ]);

    const [list, nextValidators] = await this.getGeneratorList();
    const response = validators.map((validator) => this.getValidatorResponse(validator, list));

    return new GatewayResponse(response, {
      nextValidators,
      count: validators.length,
      offset,
      total,
    });
  }

  private getValidatorResponse(
    validator: Prisma.ValidatorGetPayload<{ include: { account: true } }>,
    list: Generator[],
  ): GetValidatorResponseDto {
    const { account, ...rest } = validator;
    const newValidator: GetValidatorResponseDto = {
      ...rest,
      account: {
        address: account.address,
        publicKey: account.publicKey,
        name: account.name,
      },
      totalStake: validator.totalStake.toString(),
      selfStake: validator.selfStake.toString(),
      validatorWeight: validator.validatorWeight.toString(),
      nextAllocatedTime: list.find((gen) => gen.address === account.address)?.nextAllocatedTime,
      sharingCoefficients: JSON.parse(validator.sharingCoefficients),
    };

    if (!account.publicKey) delete account.publicKey;
    return newValidator;
  }

  private async getGeneratorList() {
    const { list } = await this.nodeApiService.invokeApi<GeneratorList>(
      NodeApi.CHAIN_GET_GENERATOR_LIST,
      {},
    );
    if (!list) throw new Error('Failed to fetch generator list');

    const nextValidators = list
      .sort(
        (a, b) => new Date(a.nextAllocatedTime).getTime() - new Date(b.nextAllocatedTime).getTime(),
      )
      .slice(0, NEXT_VALIDATORS_META);

    await Promise.all(
      nextValidators.map(async (validator) => {
        const response = await this.nodeApiService.invokeApi<ValidatorInfo>(
          NodeApi.POS_GET_VALIDATOR,
          {
            address: validator.address,
          },
        );
        validator.name = response.name;
      }),
    );

    return [list, nextValidators];
  }
}
