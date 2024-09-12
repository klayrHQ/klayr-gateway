// handlers/add-stakes.handler.ts
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Mutex } from 'async-mutex';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { Staker } from 'src/modules/node-api/types';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export class AddStakesCommand implements ICommand {
  constructor(public readonly staker: string) {}
}
const stakesMutex = new Mutex();

@CommandHandler(AddStakesCommand)
export class AddStakesHandler implements ICommandHandler<AddStakesCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  async execute(command: AddStakesCommand): Promise<void> {
    const release = await stakesMutex.acquire();

    try {
      const { staker } = command;

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
      release();
    }
  }
}
