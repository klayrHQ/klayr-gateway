import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NodeApi, NodeApiService } from '../node-api/node-api.service';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import { GetAppsDto } from './dto/get-apps.dto';
import { ChainAccounts } from '../node-api/types';

@ApiTags('Interoperability')
@Controller('blockchain')
export class InteroperabilityController {
  constructor(private readonly nodeApi: NodeApiService) {}

  @Get('apps')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  // @ApiResponse(getAuthResponse)
  async getAuth(@Query() query: GetAppsDto): Promise<GatewayResponse<any>> {
    const { chainID } = query;

    const apps = await this.nodeApi.invokeApi<ChainAccounts>(
      NodeApi.INTEROPERABILITY_GET_ALL_CHAIN_ACCOUNTS,
      {
        chainID,
      },
    );

    console.log(apps);

    if (ControllerHelpers.isNodeApiError(apps))
      throw new HttpException(apps.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse(apps, {});
  }
}
