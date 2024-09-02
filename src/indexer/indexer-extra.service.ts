import { Injectable, Logger } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { KnownAccounts } from './types';
import {
  INSERT_KNOWN_ACCOUNTS,
  KNOWN_ACCOUNTS_MAINNET_URL,
  KNOWN_ACCOUNTS_TESTNET_URL,
} from 'src/utils/constants';

@Injectable()
export class IndexerExtraService {
  private readonly logger = new Logger(IndexerExtraService.name);

  constructor(private readonly accountService: AccountService) {}

  async onApplicationBootstrap() {
    this.logger.debug(`IndexerExtraService onApplicationBootstrap`);
    if (INSERT_KNOWN_ACCOUNTS) await this.writeKnownAccounts();
  }

  private async writeKnownAccounts() {
    const knownAccounts = await this.getKnownAccounts();
    for (const [address, accountInfo] of Object.entries(knownAccounts)) {
      if (address === 'address') continue; // interface in first row

      await this.accountService.updateOrCreateAccount({
        address: address,
        name: `${accountInfo.owner} (${accountInfo.description})`,
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
