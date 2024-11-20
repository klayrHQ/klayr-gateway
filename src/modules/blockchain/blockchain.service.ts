import { Injectable, OnModuleInit } from '@nestjs/common';
import { GithubService } from './github.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppJsonContents } from './blockchain.interface';
import { BLOCKCHAIN_NETWORKS } from 'src/config/constants';
import { LokiLogger } from 'nestjs-loki-logger';

const APP_JSON_FILE = 'app.json';
const NATIVE_TOKENS_FILE = 'nativetokens.json';
const DIRECTORY = 'dir';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new LokiLogger(BlockchainService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly githubService: GithubService,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'prod') return;
    this.logger.log('Fetching app registry contents');
    const existingApp = await this.prisma.app.findFirst();
    if (existingApp) return;
    await this.fetchRepoContents();
  }

  async fetchRepoContents() {
    try {
      const branch = process.env.APP_REGISTRY_BRANCH;

      for (const network of Object.values(BLOCKCHAIN_NETWORKS)) {
        await this.processNetwork(network, branch);
      }
    } catch (error) {
      this.logger.error('Error handling app registry contents:', error);
    }
  }

  private async processNetwork(network: string, branch: string) {
    const response = await this.githubService.getRepoContents(network, branch);

    for (const item of response) {
      if (item.type === DIRECTORY) {
        await this.processDirectory(item.path, branch);
      }
    }
  }

  private async processDirectory(path: string, branch: string) {
    const dirContents = await this.githubService.getRepoContents(path, branch);

    let chainID: string;
    for (const dirItem of dirContents) {
      if (dirItem.name === APP_JSON_FILE) {
        chainID = await this.processAppJsonFile(dirItem.download_url);
      }
      if (dirItem.name === NATIVE_TOKENS_FILE) {
        await this.processNativeTokensFile(dirItem.download_url, chainID);
      }
    }
  }

  private async processAppJsonFile(downloadUrl: string): Promise<string> {
    const appJsonContents = await this.githubService.getFileContents(downloadUrl);
    await this.createAndSaveAppData(appJsonContents);
    return appJsonContents.chainID;
  }

  private async processNativeTokensFile(downloadUrl: string, chainID: string) {
    const nativeTokensContents = await this.githubService.getFileContents(downloadUrl);
    await this.createAndSaveNativeTokens(nativeTokensContents.tokens, chainID);
  }

  private async createAndSaveAppData(appJsonContents: AppJsonContents) {
    const {
      title,
      description,
      chainName,
      displayName,
      chainID,
      networkType,
      genesisURL,
      projectPage,
      backgroundColor,
      logo,
      serviceURLs,
      explorers,
      appNodes,
    } = appJsonContents;

    const appData = {
      title,
      description,
      chainName,
      displayName,
      chainID,
      networkType,
      genesisURL,
      projectPage,
      backgroundColor,
      logo: {
        create: logo,
      },
      serviceURLs: {
        create: serviceURLs,
      },
      explorers: {
        create: explorers,
      },
      appNodes: {
        create: appNodes,
      },
    };

    await this.prisma.app.create({
      data: appData,
    });
  }

  private async createAndSaveNativeTokens(nativeTokensContents: any, chainID: string) {
    for (const token of nativeTokensContents) {
      const { tokenID, tokenName, description, logo, symbol, displayDenom, baseDenom, denomUnits } =
        token;

      const tokenData = {
        tokenID,
        chainID,
        tokenName,
        description,
        logo: {
          create: logo,
        },
        symbol,
        displayDenom,
        baseDenom,
        denomUnits: {
          create: denomUnits,
        },
      };

      await this.prisma.token.create({
        data: tokenData,
      });
    }
  }
}
