import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { StateService } from '../state/state.service';
import { Modules } from '../state/types';
import { PrismaService } from '../prisma/prisma.service';
import { NodeApiService } from '../node-api/node-api.service';

@Injectable()
export class IsSyncedIndicator extends HealthIndicator {
  constructor(
    private readonly state: StateService,
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indexerState = this.state.get(Modules.INDEXER);

    const nextBlockToSync = await this.prisma.nextBlockToSync.findFirst();
    const nodeHeight = this.nodeApi.nodeInfo.height;
    const synced = nodeHeight - nextBlockToSync.height < 10;

    const result = this.getStatus(key, synced, {
      state: indexerState,
    });

    if (synced) {
      return result;
    }
    throw new HealthCheckError('Node not fully synced', result);
  }
}
