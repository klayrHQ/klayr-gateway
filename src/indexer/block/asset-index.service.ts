import { Injectable } from '@nestjs/common';
import { Asset, Block } from '../interfaces/block.interface';
import { AssetTypes } from '../interfaces/asset.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { Payload } from 'src/event/types';
import { LokiLogger } from 'nestjs-loki-logger';

@Injectable()
export class AssetIndexService {
  private readonly logger = new LokiLogger(AssetIndexService.name);

  constructor(private readonly prisma: PrismaService) {}

  public async indexAssets(blocks: Block[]) {
    // this.logger.debug('Asset module: New asset event');
    const assets = this.processAssets(blocks);

    const assetsInput = assets.flatMap(({ height, data }) =>
      data.map((asset) => ({
        height,
        module: asset.module,
        data: this.createAssetData(asset),
      })),
    );

    await this.prisma.asset.createMany({
      data: assetsInput,
    });
  }

  private processAssets(blocks: Block[]): Payload<Asset>[] {
    return blocks.map((block: Block) => ({
      height: block.header.height,
      data: block.assets,
    }));
  }

  private createAssetData(asset: Asset) {
    switch (asset.module) {
      case AssetTypes.RANDOM:
        return JSON.stringify({
          seedReveal: asset.data.substring(4),
        });
      default:
        return JSON.stringify(asset.data);
    }
  }
}
