import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { NodeApiService } from '../node-api/node-api.service';

@Injectable()
export class IsSyncedIndicator extends HealthIndicator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const nodeBlockHeight = this.nodeApi.nodeInfo.height;
    const gatewayBlockHeight = (await this.prisma.nextBlockToSync.findFirst()).height;

    const isGatewaySynced = gatewayBlockHeight >= nodeBlockHeight;
    const result = this.getStatus(key, isGatewaySynced, {
      gatewayHeight: gatewayBlockHeight,
      nodeHeight: nodeBlockHeight,
    });

    if (isGatewaySynced) {
      return result;
    }
    throw new HealthCheckError('Node not fully synced', result);
  }
}
