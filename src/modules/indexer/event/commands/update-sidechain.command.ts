// handlers/token-execution-result.handler.ts
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { NodeApiService } from 'src/modules/node-api/node-api.service';
import { LokiLogger } from 'nestjs-loki-logger';
import { ChainAccountUpdateEvent } from '../types';

enum BlockchainAppStatus {
  Registered = 'registered',
  Activated = 'activated',
  Terminated = 'terminated',
}

export class UpdateSidechainCommand implements ICommand {
  constructor(public readonly data: ChainAccountUpdateEvent) {}
}

@CommandHandler(UpdateSidechainCommand)
export class UpdateSidechainHandler implements ICommandHandler<UpdateSidechainCommand> {
  private readonly logger = new LokiLogger(UpdateSidechainHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  async execute(command: UpdateSidechainCommand): Promise<void> {
    this.logger.debug('Updating sidechain...', command.data.toString());
    const { name, lastCertificate, status } = command.data;
    const app = await this.prisma.blockchainApp.findUnique({
      where: { chainName: name },
    });

    if (!app) {
      this.logger.error(`BlockchainApp with chainName ${name} not found.`);
      return;
    }

    const amounts = this.nodeApi.tokenSummaryInfo.escrowedAmounts;
    if (!amounts) {
      this.logger.error('Failed to fetch escrowed amounts.');
      return;
    }
    const escrowForApp = amounts.escrowedAmounts.find(
      (escrow) => escrow.escrowChainID === app.chainID,
    );

    await this.prisma.blockchainApp.update({
      where: { chainName: name },
      data: {
        status: this.getStatusString(status),
        lastCertificateHeight: lastCertificate.height,
        lastUpdated: lastCertificate.timestamp,
        escrowedKLY: escrowForApp?.amount || '0',
        escrow: {
          deleteMany: {},
          create: {
            tokenID: escrowForApp.tokenID,
            amount: escrowForApp.amount,
          },
        },
      },
    });
  }

  private getStatusString(status: number): string | undefined {
    switch (status) {
      case 0:
        return BlockchainAppStatus.Registered;
      case 1:
        return BlockchainAppStatus.Activated;
      case 2:
        return BlockchainAppStatus.Terminated;
      default:
        return undefined;
    }
  }
}
