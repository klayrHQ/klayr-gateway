import { Injectable, Logger } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { AssetTypes } from 'src/asset/types';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Block, NodeInfo } from 'src/node-api/types';
import { ValidatorService } from 'src/validator/validator.service';

@Injectable()
export class IndexerGenesisService {
  private readonly logger = new Logger(IndexerGenesisService.name);

  constructor(
    private readonly nodeApiService: NodeApiService,
    private readonly validatorService: ValidatorService,
    private readonly accountService: AccountService,
  ) {}

  async onModuleInit() {
    this.logger.debug(`Genesis block event`);
    const nodeInfo: NodeInfo = await this.nodeApiService.getAndSetNodeInfo();
    const genesisBlock = await this.nodeApiService.invokeApi<Block>(
      NodeApi.CHAIN_GET_BLOCK_BY_HEIGHT,
      {
        height: nodeInfo.genesisHeight,
      },
    );

    await this.processGenesisBlock(genesisBlock);
  }

  private async processGenesisBlock(block: Block) {
    const decodedAssets = block.assets.map((asset) => {
      const decoded = this.nodeApiService.decodeAssetData(asset.module, asset.data);
      return {
        name: asset.module,
        message: decoded,
      };
    });

    for (const decodedAsset of decodedAssets) {
      await this.handleDecodedAssets(decodedAsset);
    }

    await this.accountService.createAccountsBulk([{ address: block.header.generatorAddress }]);
  }

  // TODO: handle other genesis assets. Probably in new modules
  private async handleDecodedAssets(decodedAsset: { name: string; message: any }) {
    switch (decodedAsset.name) {
      case AssetTypes.POS:
        await this.validatorService.processPosAsset(decodedAsset.message.validators);
        break;

      default:
        this.logger.warn(`Unhandled asset in Genesis block: ${decodedAsset.name}`);
    }
  }
}
