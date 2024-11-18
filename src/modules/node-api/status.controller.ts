import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { NodeApiService } from './node-api.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayResponse } from 'src/utils/controller-helpers';
import {
  GetIndexStatusData,
  GetIndexStatusResDto,
  getIndexStatusResponse,
} from './dto/get-index-status-res.dto';

@ApiTags('Index Status')
@Controller()
export class StatusController {
  constructor(
    private readonly nodeApi: NodeApiService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('index/status')
  @ApiResponse(getIndexStatusResponse)
  async getIndexStatus(): Promise<GetIndexStatusResDto> {
    const nextBlockToSync = await this.prisma.nextBlockToSync.findFirst();
    const nodeInfo = this.nodeApi.nodeInfo;

    if (!nextBlockToSync || !nodeInfo) {
      throw new HttpException('Index status not found', HttpStatus.NOT_FOUND);
    }

    const lastIndexedBlockHeight = nextBlockToSync.height - 1;
    const chainLength = nodeInfo.height + 1;
    const numBlocksIndexed = lastIndexedBlockHeight - nodeInfo.genesisHeight + 1;
    const percentageIndexed = (numBlocksIndexed / chainLength) * 100;
    const isIndexingInProgress = nodeInfo.height - nextBlockToSync.height > 10;

    const indexStatus: GetIndexStatusData = {
      genesisHeight: nodeInfo.genesisHeight,
      lastBlockHeight: nodeInfo.height,
      lastIndexedBlockHeight,
      chainLength,
      numBlocksIndexed,
      percentageIndexed: parseFloat(percentageIndexed.toFixed(2)),
      isIndexingInProgress,
    };

    return new GatewayResponse(indexStatus, {
      lastUpdate: Math.floor(Date.now() / 1000),
    });
  }
}
