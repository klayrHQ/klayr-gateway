import { codec } from '@klayr/codec';
import { Injectable, Logger } from '@nestjs/common';
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
  ) {}

  async onModuleInit() {
    this.logger.debug(`Block module: Genesis block event`);
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
    const schema = await this.nodeApiService.invokeApi<any>(NodeApi.SYSTEM_GET_METADATA, {});
    const assetSchema = schema.modules;

    const decodedAssets = block.assets.map((asset) => {
      const schema = assetSchema.find((schema: { name: string }) => schema.name === asset.module);
      const decoded = codec.decodeJSON(schema.assets[0].data, Buffer.from(asset.data, 'hex'));
      return {
        name: asset.module,
        message: decoded,
      };
    });

    for (const decodedAsset of decodedAssets) {
      this.handleDecodedAssets(decodedAsset);
    }
  }

  private async handleDecodedAssets(decodedAsset: { name: string; message: any }) {
    switch (decodedAsset.name) {
      case AssetTypes.POS:
        await this.validatorService.processPosAsset(decodedAsset.message.validators);
        break;
      default:
        this.logger.warn(`Unhandled asset name: ${decodedAsset.name}`);
    }
  }
}
