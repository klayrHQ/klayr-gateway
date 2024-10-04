import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { KNOWN_ACCOUNTS_MAINNET_URL, KNOWN_ACCOUNTS_TESTNET_URL } from 'src/utils/constants';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { KnownAccounts } from 'src/modules/indexer/interfaces/known-accounts.interface';
import { LokiLogger } from 'nestjs-loki-logger';

export class IndexKnownAccountsCommand implements ICommand {}

@CommandHandler(IndexKnownAccountsCommand)
export class IndexKnownAccountsHandler implements ICommandHandler<IndexKnownAccountsCommand> {
  private readonly logger = new LokiLogger(IndexKnownAccountsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<void> {
    this.logger.debug(`Indexing known accounts`);
    if (process.env.INDEX_KNOWN_ACCOUNTS === 'true') await this.writeKnownAccounts();
  }

  private async writeKnownAccounts() {
    const knownAccounts = await this.getKnownAccounts();
    for (const [address, accountInfo] of Object.entries(knownAccounts)) {
      if (address === 'address') continue; // interface in first row

      await this.prisma.account.upsert({
        where: { address },
        update: {
          name: `${accountInfo.owner} (${accountInfo.description})`,
        },
        create: {
          address,
          name: `${accountInfo.owner} (${accountInfo.description})`,
        },
      });
    }
  }

  private async getKnownAccounts() {
    const knownAccountsUrl = process.env.NODE_URL.includes('mainnet')
      ? KNOWN_ACCOUNTS_MAINNET_URL
      : process.env.NODE_URL.includes('testnet')
        ? KNOWN_ACCOUNTS_TESTNET_URL
        : undefined;

    if (!knownAccountsUrl) {
      this.logger.error(`Unknown network: ${process.env.NODE_URL}`);
      return;
    }

    const response = await fetch(knownAccountsUrl);

    if (!response.ok) {
      throw new Error(`Error getting known accounts, status: ${response.status}`);
    }

    const data: KnownAccounts[] = await response.json();
    return data;
  }
}
