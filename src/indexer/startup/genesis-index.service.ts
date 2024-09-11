import { Injectable, Logger } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { EventService } from 'src/event/event.service';
import { GatewayEvents } from 'src/event/types';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Block } from '../interfaces/block.interface';
import { AssetTypes } from '../interfaces/asset.interface';

@Injectable()
export class GenesisIndexService {
  private readonly logger = new Logger(GenesisIndexService.name);

  constructor(
    private readonly nodeApiService: NodeApiService,
    private readonly accountService: AccountService,
    private readonly eventService: EventService,
  ) {}

  public async processGenesisBlock() {
    const block = await this.nodeApiService.invokeApi<Block>(NodeApi.CHAIN_GET_BLOCK_BY_HEIGHT, {
      height: this.nodeApiService.nodeInfo.genesisHeight,
    });

    const decodedAssets = block.assets.map((asset) => {
      const decoded = this.nodeApiService.decodeAssetData(asset.module, asset.data);
      return {
        name: asset.module,
        message: decoded,
      };
    });
    // Token asset should be processed first
    decodedAssets.sort((a) => (a.name === AssetTypes.TOKEN ? -1 : 0));

    for await (const decodedAsset of decodedAssets) {
      await this.handleDecodedAssets(decodedAsset);
    }

    await this.accountService.updateOrCreateAccount({ address: block.header.generatorAddress });
  }

  // TODO: handle other genesis assets. Probably in new modules
  private async handleDecodedAssets(decodedAsset: { name: string; message: any }) {
    switch (decodedAsset.name) {
      case AssetTypes.TOKEN:
        this.logger.debug('Genesis token asset');
        await this.handleGenesisTokenAsset(decodedAsset.message.userSubstore);
        break;
      case AssetTypes.POS:
        this.logger.debug('Genesis POS asset');
        // ! for genesis-index module
        await this.eventService.pushToGeneralEventQ({
          event: GatewayEvents.PROCESS_POS_ASSET,
          payload: decodedAsset.message.validators,
        });

        break;

      default:
        this.logger.warn(`Unhandled asset in Genesis block: ${decodedAsset.name}`);
    }
  }

  private async handleGenesisTokenAsset(users: { address: string }[]) {
    const addresses = users.map((user) => ({ address: user.address }));

    await this.accountService.createAccountsBulk(addresses);
  }
}
