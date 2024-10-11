import { Injectable, OnModuleInit } from '@nestjs/common';
import { GithubService } from './github.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppJsonContents } from './blockchain.interface';
import { BLOCKCHAIN_NETWORKS } from 'src/utils/constants';
import { LokiLogger } from 'nestjs-loki-logger';

const APP_JSON_FILE = 'app.json';
const DIRECTORY = 'dir';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new LokiLogger(BlockchainService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly githubService: GithubService,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'prod') {
      this.logger.log('Fetching app registry contents');
      await this.fetchRepoContents();
    }
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

    for (const dirItem of dirContents) {
      if (dirItem.name === APP_JSON_FILE) {
        await this.processAppJsonFile(dirItem.download_url);
      }
    }
  }

  private async processAppJsonFile(downloadUrl: string) {
    const appJsonContents = await this.githubService.getFileContents(downloadUrl);
    await this.createAndSaveAppData(appJsonContents);
  }

  private async createAndSaveAppData(appJsonContents: AppJsonContents) {
    const appData = {
      title: appJsonContents.title,
      description: appJsonContents.description,
      chainName: appJsonContents.chainName,
      displayName: appJsonContents.displayName,
      chainID: appJsonContents.chainID,
      networkType: appJsonContents.networkType,
      genesisURL: appJsonContents.genesisURL,
      projectPage: appJsonContents.projectPage,
      backgroundColor: appJsonContents.backgroundColor,
      logo: {
        create: {
          png: appJsonContents.logo.png,
          svg: appJsonContents.logo.svg,
        },
      },
      serviceURLs: {
        create: appJsonContents.serviceURLs.map((url: any) => ({
          http: url.http,
          ws: url.ws,
          apiCertificatePublicKey: url.apiCertificatePublicKey,
        })),
      },
      explorers: {
        create: appJsonContents.explorers.map((explorer: any) => ({
          url: explorer.url,
          txnPage: explorer.txnPage,
        })),
      },
      appNodes: {
        create: appJsonContents.appNodes.map((node: any) => ({
          url: node.url,
          maintainer: node.maintainer,
          apiCertificatePublicKey: node.apiCertificatePublicKey,
        })),
      },
    };

    await this.prisma.app.create({
      data: appData,
    });
  }
}
