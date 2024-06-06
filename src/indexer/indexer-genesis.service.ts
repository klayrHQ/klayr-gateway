import { codec } from '@klayr/codec';
import { Injectable, Logger } from '@nestjs/common';
import { AssetTypes, PosAsset } from 'src/asset/types';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Block, NodeInfo } from 'src/node-api/types';

@Injectable()
export class InderGenesisService {
  private readonly logger = new Logger(InderGenesisService.name);

  constructor(private readonly nodeApiService: NodeApiService) {}

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
        await this.processPosAsset(decodedAsset.message);
        break;
      case AssetTypes.TOKEN:
        // await this.processTokenAsset(decodedAsset.message);
        break;
      default:
        console.log(`Unknown asset name: ${decodedAsset.name}`);
    }
  }

  private async processPosAsset(posAsset: PosAsset) {
    console.log(posAsset.validators);
  }
}
