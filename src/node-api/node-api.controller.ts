import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { NodeApiService } from './node-api.service';

@Controller('node-api')
export class NodeApiController {
  constructor(private readonly nodeApiService: NodeApiService) {}

  @Get('chain/getBlockByID/:id')
  async getBlockById(@Param('id') id: string) {
    return this.nodeApiService.getBlockById(id);
  }

  @Get('chain/getBlocksByHeight')
  async getBlocksFromNode(@Query('from') from: string, @Query('to') to: string) {
    const fromNumber = Number(from);
    const toNumber = Number(to);

    if (isNaN(fromNumber) || isNaN(toNumber) || fromNumber < 0 || toNumber < 0) {
      throw new BadRequestException('from and to must be positive numbers');
    }

    return this.nodeApiService.getBlocksFromNode({ from: fromNumber, to: toNumber });
  }

  @Get('system/getNodeInfo')
  async getNodeInfo() {
    return this.nodeApiService.getNodeInfo();
  }
}
