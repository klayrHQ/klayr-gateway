import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { NodeApiService } from './node-api.service';

@Controller('invoke')
export class NodeApiController {
  constructor(private readonly nodeApiService: NodeApiService) {}

  @Post()
  async invokeNodeApi(@Body() body: any) {
    const { endpoint, params } = body;
    if (!endpoint || !params) {
      throw new BadRequestException('Missing endpoint or params');
    }

    return this.nodeApiService.invokeApi(endpoint, params);
  }
}
