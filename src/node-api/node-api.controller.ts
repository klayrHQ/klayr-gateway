import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { NodeApiService } from './node-api.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { invokeNodeApiResponse } from './open-api/return-types';
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
@Controller('invoke')
export class NodeApiController {
  constructor(private readonly nodeApiService: NodeApiService) {}

  @Post()
  @ApiBody(invokeNodeApiBody)
  @ApiResponse(invokeNodeApiResponse)
  async invokeNodeApi(@Body() body: InvokeBodyDto) {
    const { endpoint, params } = body;
    if (!endpoint || !params) {
      throw new BadRequestException('Missing endpoint or params');
    }

    return this.nodeApiService.invokeApi(endpoint, params);
  }
}
