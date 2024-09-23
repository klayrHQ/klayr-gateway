// handlers/token-execution-result.handler.ts
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { TokenBalance } from 'src/modules/node-api/types';
import { LokiLogger } from 'nestjs-loki-logger';

export class UpdateAccountCommand implements ICommand {
  constructor(
    public readonly address: string,
    public readonly tokenID: string,
  ) {}
}

@CommandHandler(UpdateAccountCommand)
export class UpdateAccountHandler implements ICommandHandler<UpdateAccountCommand> {
  private readonly logger = new LokiLogger(UpdateAccountHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  async execute(command: UpdateAccountCommand): Promise<void> {
    const { address, tokenID } = command;

    const accountInfo = await this.nodeApi.invokeApi<TokenBalance>(NodeApi.TOKEN_GET_BALANCE, {
      address,
      tokenID,
    });

    if (!accountInfo || !accountInfo.lockedBalances || !accountInfo.availableBalance) {
      return this.logger.error(`Failed to get account info for address ${address}`);
    }

    const lockedBalance = accountInfo.lockedBalances.reduce((sum, balance) => {
      return sum + BigInt(balance.amount);
    }, BigInt(0));

    const availableBalance = BigInt(accountInfo.availableBalance);
    const totalBalance = lockedBalance + availableBalance;

    await this.prisma.account.update({
      where: { address },
      data: {
        availableBalance: availableBalance,
        lockedBalance: lockedBalance,
        totalBalance: totalBalance,
      },
    });
  }
}
