import { Injectable } from '@nestjs/common';
import { StakeRepoService } from './stake-repo.service';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Staker } from 'src/node-api/types';
import { waitTimeout } from 'src/utils/helpers';

@Injectable()
export class StakeService {
  private lockStore = new Map<string, boolean>();

  constructor(
    private readonly stakeRepo: StakeRepoService,
    private readonly nodeApi: NodeApiService,
  ) {}

  public async addStakesFromStaker(staker: string) {
    // TODO: Lock and timeout are crap, will fix when double events are filtered out
    await waitTimeout(2000);
    if (!this.acquireLock(staker)) return;

    const stakes = await this.nodeApi.invokeApi<Staker>(NodeApi.POS_GET_STAKER, {
      address: staker,
    });

    await this.stakeRepo.deleteManyStakes({ staker });

    const stakesWithStaker = stakes.stakes.map((stake) => ({
      staker,
      validatorAddress: stake.validatorAddress,
      amount: BigInt(stake.amount),
    }));

    await this.stakeRepo.createStakesBulk(stakesWithStaker);

    this.releaseLock(staker);
  }

  private acquireLock(key: string): boolean {
    if (this.lockStore.get(key)) return false;

    this.lockStore.set(key, true);
    return true;
  }

  private releaseLock(key: string) {
    this.lockStore.delete(key);
  }
}
