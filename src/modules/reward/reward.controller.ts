import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NodeApi, NodeApiService } from '../node-api/node-api.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import {
  getAnnualInflationRes,
  GetAnnualInflationResDto,
} from './dto/get-annual-inflation-res.dto';
import { AnnualInflation, DefaultReward, FeeTokenID } from '../node-api/types';
import { GetAnnualInflationDto } from './dto/get-annual-inflation.dto';
import { getDefaultRewardRes, GetDefaultRewardResDto } from './dto/get-default-reward-res.dto';
import { GetDefaultRewardDto } from './dto/get-default-reward.dto';
import {
  getRewardConstantsRes,
  GetRewardConstantsResDto,
} from './dto/get-reward-constants-res.dto';

@ApiTags('Reward')
@Controller('reward')
export class RewardController {
  constructor(private readonly nodeApi: NodeApiService) {}

  @Get('annual-inflation')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getAnnualInflationRes)
  async getAnnualInflation(
    @Query() query: GetAnnualInflationDto,
  ): Promise<GetAnnualInflationResDto> {
    const { height } = query;

    const annualInflation = await this.nodeApi.invokeApi<AnnualInflation>(
      NodeApi.REWARD_GET_ANNUAL_INFLATION,
      {
        height: Number(height),
      },
    );

    if (ControllerHelpers.isNodeApiError(annualInflation))
      throw new HttpException(annualInflation.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse(annualInflation, {});
  }

  @Get('default')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getDefaultRewardRes)
  async getDefaultReward(@Query() query: GetDefaultRewardDto): Promise<GetDefaultRewardResDto> {
    const { height } = query;

    const defaultReward = await this.nodeApi.invokeApi<DefaultReward>(
      NodeApi.REWARD_GET_DEFAULT_REWARD_AT_HEIGHT,
      {
        height: Number(height),
      },
    );

    if (ControllerHelpers.isNodeApiError(defaultReward))
      throw new HttpException(defaultReward.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse(defaultReward, {});
  }

  @Get('constants')
  @ApiResponse(getRewardConstantsRes)
  async getRewardConstants(): Promise<GetRewardConstantsResDto> {
    const result = await this.nodeApi.invokeApi<FeeTokenID>(NodeApi.REWARD_GET_REWARD_TOKEN_ID, {});

    if (ControllerHelpers.isNodeApiError(result))
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse({ rewardTokenID: result.tokenID }, {});
  }
}
