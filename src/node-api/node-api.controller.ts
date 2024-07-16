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
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { getNodeInfoResponse } from './dto/get-node-info-res.dto';
import { InvokeBodyDto } from './dto/invoke.dto';
import { invokeNodeApiResponse } from './dto/invoke-res.dto';

@ApiTags('Invoke')
@Controller('node')
export class NodeApiController {
  constructor(private readonly nodeApiService: NodeApiService) {}

  // TODO: return type
  @Get('info')
  @ApiResponse(getNodeInfoResponse)
  getNodeInfo() {
    return this.nodeApiService.nodeInfo;
  }

  // TODO: return type
  @Post('invoke')
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
