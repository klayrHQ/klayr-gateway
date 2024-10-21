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
    if (!knownAccounts) return;
    for (const [address, accountInfo] of Object.entries(knownAccounts)) {
      if (address === 'address') continue; // interface in first row

      await this.prisma.account.upsert({
        where: { address },
        update: {
          name: `${accountInfo.owner}`,
          description: `${accountInfo.description}`,
        },
        create: {
          address,
          name: `${accountInfo.owner}`,
          description: `${accountInfo.description}`,
        },
      });
    }
  }

  private async getKnownAccounts() {
    if (!process.env.INDEX_KNOWN_ACCOUNTS) {
      this.logger.error('INDEX_KNOWN_ACCOUNTS env variable not set');
      return;
    }

    const knownAccountsUrl =
      process.env.KLAYR_ENV === 'mainnet'
        ? KNOWN_ACCOUNTS_MAINNET_URL
        : process.env.KLAYR_ENV === 'testnet'
          ? KNOWN_ACCOUNTS_TESTNET_URL
          : undefined;

    if (!knownAccountsUrl) {
      this.logger.error(`Unknown network: ${process.env.KLAYR_ENV}`);
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
