// handlers/add-stakes.handler.ts
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { Staker } from 'src/modules/node-api/types';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { waitTimeout } from 'src/utils/helpers';

export class AddStakesCommand implements ICommand {
  constructor(public readonly staker: string) {}
}

@CommandHandler(AddStakesCommand)
export class AddStakesHandler implements ICommandHandler<AddStakesCommand> {
  private lockStore = new Map<string, boolean>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  async execute(command: AddStakesCommand): Promise<void> {
    const { staker } = command;

    // TODO: Lock and timeout is crap, will fix when double events are filtered out
    await waitTimeout(2000);
    if (!this.acquireLock(staker)) return;

    try {
      const stakes = await this.nodeApi.invokeApi<Staker>(NodeApi.POS_GET_STAKER, {
        address: staker,
      });

      const stakesWithStaker = stakes.stakes.map((stake) => ({
        staker,
        validatorAddress: stake.validatorAddress,
        amount: BigInt(stake.amount),
      }));

      await this.prisma.stake.deleteMany({ where: { staker } });
      await this.prisma.stake.createMany({ data: stakesWithStaker });
    } finally {
      this.releaseLock(staker);
    }
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
