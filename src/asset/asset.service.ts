import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AssetRepoService } from './asset-repo.service';
import { Asset } from 'src/node-api/types';
import { Events, Payload } from 'src/event/types';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(private assetRepo: AssetRepoService) {}

  // TODO: Is this map the most efficient way to handle this?
  @OnEvent(Events.NEW_ASSETS_EVENT)
  public async createAsset(payload: Payload<Asset>[]) {
    this.logger.debug('Asset module: New asset event');

    const assetsInput = payload.flatMap(({ height, data }) =>
      data.map((asset) => ({
        height,
        module: asset.module,
        data: asset.data,
      })),
    );

    await this.assetRepo.createAssetsBulk(assetsInput);
  }
}
