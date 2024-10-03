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
import { AnnualInflation, DefaultReward } from '../node-api/types';
import { GetAnnualInflationDto } from './dto/get-annual-inflation.dto';
import { getDefaultRewardRes, GetDefaultRewardResDto } from './dto/get-default-reward-res.dto';
import { GetDefaultRewardDto } from './dto/get-default-reward.dto';

@ApiTags('Reward')
@Controller('reward')
export class RewardController {
  constructor(private readonly nodeApi: NodeApiService) {}

  @Get('annual-inflation')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getAnnualInflationRes)
  async getAnnualInflation(
    @Query() query: GetAnnualInflationDto,
  ): Promise<GatewayResponse<GetAnnualInflationResDto>> {
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
  async getDefaultReward(
    @Query() query: GetDefaultRewardDto,
  ): Promise<GatewayResponse<GetDefaultRewardResDto>> {
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
}
