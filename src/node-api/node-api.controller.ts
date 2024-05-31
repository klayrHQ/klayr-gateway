import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { NodeApiService } from './node-api.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { invokeNodeApiResponse } from './api/return-types';
import { invokeNodeApiBody } from './api/request-types';

@ApiTags('node API')
@Controller('invoke')
export class NodeApiController {
  constructor(private readonly nodeApiService: NodeApiService) {}

  @Post()
  @ApiBody(invokeNodeApiBody)
  @ApiResponse(invokeNodeApiResponse)
  async invokeNodeApi(@Body() body: { endpoint: string; params: object }) {
    const { endpoint, params } = body;
    if (!endpoint || !params) {
      throw new BadRequestException('Missing endpoint or params');
    }

    return this.nodeApiService.invokeApi(endpoint, params);
  }
}
