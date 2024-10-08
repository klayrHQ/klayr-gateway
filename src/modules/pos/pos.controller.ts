import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import {
  GetValidatorResponseDto,
  getValidatorCountsResponse,
  getValidatorResponse,
} from './dto/get-validator-res.dto';
import {
  ControllerHelpers,
  GatewayResponse,
  ValidatorSortTypes,
} from 'src/utils/controller-helpers';
import { ValidatorQueryDto } from './dto/get-validator.dto';
import { MAX_VALIDATORS_TO_FETCH } from 'src/utils/constants';
import { Prisma } from '@prisma/client';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import {
  ClaimableRewards,
  Generator,
  LockedReward,
  PendingUnlocks,
  PosTokenID,
} from 'src/modules/node-api/types';
import { ValidatorStatus } from './types';
import {
  getStakersResponse,
  GetStakersResponseDto,
  getStakesResponse,
  GetStakesResponseDto,
} from './dto/get-stakes-res.dto';
import { StakesQueryDto } from './dto/get-stakes.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { GetClaimableRewardsDto } from './dto/get-claimable-rewards.dto';
import {
  getClaimableRewardsResponse,
  GetClaimableRewardsResponseDto,
} from './dto/get-claimable-rewards-res.dto';
import { getUnlocksResponse, GetUnlocksResponseDto } from './dto/get-unlocks-res.dto';
import { GetUnlocksDto } from './dto/get-unlocks.dto';
import { GetLockedRewardsDto } from './dto/get-locked-rewards.dto';
import { GetLockedRewardsResDto } from './dto/get-locked-rewards-res.dto';

@ApiTags('Pos')
@Controller('pos')
export class PosController {
  constructor(
    private readonly nodeApi: NodeApiService,
    private readonly prisma: PrismaService,
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

    const { list } = this.nodeApi.generatorList;

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
      this.prisma.validator.findMany({
        ...queryOptions,
        include: { account: true },
      }),
      this.prisma.validator.count({ where }),
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
        [status]: await this.prisma.validator.count({ where: { status } }),
      })),
    );

    const formattedCounts = counts.reduce((acc, countObj) => ({ ...acc, ...countObj }));
    return {
      data: formattedCounts,
      meta: {},
    };
  }

  @Get('rewards/claimable')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getClaimableRewardsResponse)
  async getClaimableRewards(
    @Query() query: GetClaimableRewardsDto,
  ): Promise<GatewayResponse<GetClaimableRewardsResponseDto>> {
    const account = await this.findAccount(this.prisma, query);
    if (!account) throw new BadRequestException('Account not found');

    const claimableRewards = await this.nodeApi.invokeApi<ClaimableRewards>(
      NodeApi.POS_GET_CLAIMABLE_REWARDS,
      {
        address: account.address,
      },
    );

    if (ControllerHelpers.isNodeApiError(claimableRewards))
      throw new HttpException(claimableRewards.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse(claimableRewards, { account });
  }

  @Get('rewards/locked')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getClaimableRewardsResponse)
  async getLockedRewards(
    @Query() query: GetLockedRewardsDto,
  ): Promise<GatewayResponse<GetLockedRewardsResDto[]>> {
    const account = await this.findAccount(this.prisma, query);
    if (!account) throw new BadRequestException('Account not found');

    const posTokenID = await this.nodeApi.invokeApi<PosTokenID>(NodeApi.POS_GET_POS_TOKEN_ID, {});
    if (ControllerHelpers.isNodeApiError(posTokenID))
      throw new HttpException(posTokenID.error, HttpStatus.NOT_FOUND);

    const rewards = await this.nodeApi.invokeApi<LockedReward>(NodeApi.POS_GET_LOCKED_REWARD, {
      address: account.address,
      tokenID: posTokenID.tokenID,
    });
    if (ControllerHelpers.isNodeApiError(rewards))
      throw new HttpException(rewards.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse([{ tokenID: posTokenID.tokenID, reward: rewards.reward }], {
      account,
    });
  }

  @Get('unlocks')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getUnlocksResponse)
  async getUnlocks(@Query() query: GetUnlocksDto): Promise<GatewayResponse<GetUnlocksResponseDto>> {
    const account = await this.findAccount(this.prisma, query);
    if (!account) throw new BadRequestException('Account not found');

    const unlocks = await this.nodeApi.invokeApi<PendingUnlocks>(NodeApi.POS_GET_PENDING_UNLOCKS, {
      address: account.address,
    });

    if (ControllerHelpers.isNodeApiError(unlocks))
      throw new HttpException(unlocks.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse(
      {
        address: account.address,
        name: account.name,
        publicKey: account.publicKey,
        pendingUnlocks: unlocks.pendingUnlocks,
      },
      {},
    );
  }

  @Get('stakes')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getStakesResponse)
  async getStakes(@Query() query: StakesQueryDto): Promise<GatewayResponse<GetStakesResponseDto>> {
    const { account, response } = await this.getAccountAndStakes(query, 'staker');
    return new GatewayResponse({ stakes: response }, { staker: account });
  }

  @Get('stakers')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getStakersResponse)
  async getStakers(
    @Query() query: StakesQueryDto,
  ): Promise<GatewayResponse<GetStakersResponseDto>> {
    const { account, response } = await this.getAccountAndStakes(query, 'validatorAddress');
    return new GatewayResponse({ stakers: response }, { validator: account });
  }

  private async getAccountAndStakes(
    query: StakesQueryDto,
    stakeKey: 'staker' | 'validatorAddress',
  ) {
    const { address, publicKey, name } = query;

    if (!address && !publicKey && !name) {
      throw new BadRequestException('At least one of address, publicKey, or name must be provided');
    }

    const account = await this.findAccount(this.prisma, query);
    if (!account) throw new BadRequestException('Account not found');

    const stakes = await this.prisma.stake.findMany({
      where: { [stakeKey]: account.address },
      include: { account: true },
    });

    const response = stakes.map((stake) => {
      return {
        address: stake.staker,
        amount: stake.amount.toString(),
        ...(stake.account.name ? { name: stake.account.name } : {}),
      };
    });

    return { account, response };
  }

  private async findAccount(
    prisma: PrismaService,
    query: { address?: string; publicKey?: string; name?: string },
  ) {
    const { address, publicKey, name } = query;
    return await prisma.account.findFirst({
      where: {
        ...(address && { address }),
        ...(publicKey && { publicKey }),
        ...(name && { name }),
      },
      select: { address: true, publicKey: true, name: true },
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
