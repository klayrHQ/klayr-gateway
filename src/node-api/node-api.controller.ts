import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { NodeApiService } from './node-api.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { getNodeInfoResponse, invokeNodeApiResponse } from './open-api/return-types';
import { invokeNodeApiBody } from './open-api/request-types';
import { IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';

class InvokeBodyDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @IsObject()
  @ValidateNested()
  params: object;
}

@ApiTags('Invoke')
@Controller('node')
export class NodeApiController {
  constructor(private readonly nodeApiService: NodeApiService) {}

  @Get('info')
  @ApiResponse(getNodeInfoResponse)
  getNodeInfo() {
    return this.nodeApiService.nodeInfo;
  }

  @Post('invoke')
  @ApiBody(invokeNodeApiBody)
  @ApiResponse(invokeNodeApiResponse)
  async invokeNodeApi(@Body() body: InvokeBodyDto) {
    const { endpoint, params } = body;
    if (!endpoint || !params) {
      throw new BadRequestException('Missing endpoint or params');
    }

    try {
      return await this.nodeApiService.invokeApi(endpoint, params);
    } catch (error) {
      throw new HttpException(
        {
          error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
