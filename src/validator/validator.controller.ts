import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ValidatorRepoService } from './validator.repo-service';
import {
  GetValidatorCountsResponseDto,
  GetValidatorResponseDto,
  getValidatorCountsResponse,
  getValidatorResponse,
} from './dto/get-validator-res.dto';
import { GatewayResponse, ValidatorSortTypes } from 'src/utils/controller-helpers';
import { ValidatorQueryDto } from './dto/get-validator.dto';
import { MAX_VALIDATORS_TO_FETCH } from 'src/utils/constants';
import { Prisma } from '@prisma/client';
import { NodeApiService } from 'src/node-api/node-api.service';
import { Generator } from 'src/node-api/types';
import { ValidatorStatus } from './types';

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

    const { list } = this.nodeApiService.generatorList;

    const where: Prisma.ValidatorWhereInput = {
      ...(address && { address }),
      ...(publicKey && { account: { publicKey } }),
      ...(name && { account: { name } }),
      ...(status && { status }),
    };

    let queryOptions = {
      where,
      take,
      skip: offset,
      orderBy: {
        [field]: direction,
      },
    };

    this.checkForNextAllocatedTimeSort(queryOptions, list, sort);

    const [validators, total] = await Promise.all([
      this.validatorRepoService.getValidators(queryOptions),
      this.validatorRepoService.countValidators({ where }),
    ]);

    const response = validators.map((validator) => this.getValidatorResponse(validator, list));
    this.applyNextAllocatedTimeSort(response, sort, take, offset);

    return new GatewayResponse(response, {
      count: validators.length,
      offset,
      total,
    });
  }

  @Get('validators/status-count')
  @ApiResponse(getValidatorCountsResponse)
  async countValidatorsByStatus(): Promise<GatewayResponse<{ [key: string]: number }>> {
    const statuses = Object.values(ValidatorStatus);
    const counts = await Promise.all(
      statuses.map(async (status) => ({
        [status]: await this.validatorRepoService.countValidators({ where: { status } }),
      })),
    );

    const formattedCounts = counts.reduce((acc, countObj) => ({ ...acc, ...countObj }));
    return {
      data: formattedCounts,
      meta: {},
    };
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
        nonce: account.nonce,
      },
      totalStake: validator.totalStake.toString(),
      selfStake: validator.selfStake.toString(),
      validatorWeight: validator.validatorWeight.toString(),
      blockReward: validator.blockReward.toString(),
      totalRewards: validator.totalRewards.toString(),
      totalSharedRewards: validator.totalSharedRewards.toString(),
      totalSelfStakeRewards: validator.totalSelfStakeRewards.toString(),
      nextAllocatedTime: list.find((gen) => gen.address === account.address)?.nextAllocatedTime,
      sharingCoefficients: JSON.parse(validator.sharingCoefficients),
    };

    if (!account.publicKey) delete account.publicKey;
    return newValidator;
  }

  private checkForNextAllocatedTimeSort(
    query: Prisma.ValidatorFindManyArgs,
    list: Generator[],
    sort: string,
  ) {
    if (
      sort === ValidatorSortTypes.NEXT_ALLOCATED_TIME_ASC ||
      sort === ValidatorSortTypes.NEXT_ALLOCATED_TIME_DESC
    ) {
      query.where = {
        address: {
          in: list.map((generator) => generator.address),
        },
      };
      delete query.orderBy;
      delete query.skip;
      delete query.take;
    }
  }

  private applyNextAllocatedTimeSort(
    response: GetValidatorResponseDto[],
    sort: string,
    take: number,
    offset: number,
  ) {
    if (
      sort === ValidatorSortTypes.NEXT_ALLOCATED_TIME_ASC ||
      sort === ValidatorSortTypes.NEXT_ALLOCATED_TIME_DESC
    ) {
      response
        .sort((a, b) => {
          const timeA = a.nextAllocatedTime ? Number(a.nextAllocatedTime) : 0;
          const timeB = b.nextAllocatedTime ? Number(b.nextAllocatedTime) : 0;

          if (sort === ValidatorSortTypes.NEXT_ALLOCATED_TIME_ASC) {
            return timeA - timeB;
          } else {
            return timeB - timeA;
          }
        })
        .slice(offset, offset + take);
    }
  }
}
