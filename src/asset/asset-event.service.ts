import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from 'src/event/event.service';
import { AssetRepoService } from './asset-repo.service';
import { Asset } from 'src/node-api/types';

@Injectable()
export class AssetEventService {
  private logger = new Logger(AssetEventService.name);

  constructor(private assetRepo: AssetRepoService) {}

  // TODO: Is this map the most efficient way to handle this?
  @OnEvent(Events.NEW_ASSETS_EVENT)
  async createAsset(
    payload: {
      height: number;
      assets: Asset[];
    }[],
  ) {
    this.logger.debug('Asset module: New asset event');

    const assetsInput = payload.flatMap(({ height, assets }) =>
      assets.map((asset) => ({
        height,
        module: asset.module,
        data: asset.data,
      })),
    );

    await this.assetRepo.createAssetsBulk(assetsInput);
  }
}
