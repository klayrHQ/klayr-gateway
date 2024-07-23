import { Injectable, Logger } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { AssetTypes } from 'src/asset/types';
import { EventService } from 'src/event/event.service';
import { GatewayEvents } from 'src/event/types';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Block, NodeInfo } from 'src/node-api/types';

@Injectable()
export class IndexerGenesisService {
  private readonly logger = new Logger(IndexerGenesisService.name);

  constructor(
    private readonly nodeApiService: NodeApiService,
    private readonly accountService: AccountService,
    private readonly eventService: EventService,
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
    // Token asset should be processed first
    decodedAssets.sort((a) => (a.name === AssetTypes.TOKEN ? -1 : 0));

    for (const decodedAsset of decodedAssets) {
      await this.handleDecodedAssets(decodedAsset);
    }

    await this.accountService.createAccountsBulk([{ address: block.header.generatorAddress }]);
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
        // TODO: Abit hacky because of the call in the onModuleInit
        setTimeout(async () => {
          await this.eventService.pushToGeneralEventQ({
            event: GatewayEvents.PROCESS_POS_ASSET,
            payload: decodedAsset.message.validators,
          });
        }, 2000);
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
