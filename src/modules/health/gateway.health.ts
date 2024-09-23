import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { StateService } from '../state/state.service';
import { IndexerState, Modules } from '../state/types';

@Injectable()
export class IsSyncedIndicator extends HealthIndicator {
  constructor(private readonly state: StateService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indexerState = this.state.get(Modules.INDEXER);

    const isGatewaySynced = indexerState === IndexerState.INDEXING;
    const result = this.getStatus(key, isGatewaySynced, {
      state: indexerState,
    });

    if (isGatewaySynced) {
      return result;
    }
    throw new HealthCheckError('Node not fully synced', result);
  }
}
