import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { Block } from '../interfaces/block.interface';
import { AssetTypes, Validator } from '../interfaces/asset.interface';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { LokiLogger } from 'nestjs-loki-logger';

export class IndexGenesisBlockCommand implements ICommand {}

@CommandHandler(IndexGenesisBlockCommand)
export class IndexGenesisBlockHandler implements ICommandHandler<IndexGenesisBlockCommand> {
  private readonly logger = new LokiLogger(IndexGenesisBlockHandler.name);

  constructor(
    private readonly nodeApiService: NodeApiService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(): Promise<void> {
    await this.processGenesisBlock();
  }

  private async processGenesisBlock() {
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

    await this.prisma.account.upsert({
      where: { address: block.header.generatorAddress },
      create: {
        address: block.header.generatorAddress,
      },
      update: {},
    });
  }

  // TODO: handle other genesis assets.
  private async handleDecodedAssets(decodedAsset: { name: string; message: any }) {
    switch (decodedAsset.name) {
      case AssetTypes.TOKEN:
        this.logger.debug('Genesis token asset');
        await this.handleGenesisTokenAsset(decodedAsset.message.userSubstore);
        break;
      case AssetTypes.POS:
        this.logger.debug('Genesis POS asset');
        await this.processPosAsset(decodedAsset.message.validators);
        break;

      default:
        this.logger.warn(`Unhandled asset in Genesis block: ${decodedAsset.name}`);
    }
  }

  private async handleGenesisTokenAsset(users: { address: string }[]) {
    const addresses = users.map((user) => ({ address: user.address }));
    await this.prisma.account.createMany({
      data: addresses,
    });
  }

  private async processPosAsset(validators: Validator[]) {
    this.logger.log('Processing POS asset');
    const accountsInput = validators.map(({ address, name }) => ({
      address,
      name,
    }));

    for (const account of accountsInput) {
      await this.prisma.account.upsert({
        where: { address: account.address },
        create: account,
        update: { name: account.name },
      });
    }

    const validatorsInput: Prisma.ValidatorCreateManyInput[] = validators.map((asset) => ({
      address: asset.address,
      blsKey: asset.blsKey,
      proofOfPossession: asset.proofOfPossession,
      generatorKey: asset.generatorKey,
      lastGeneratedHeight: asset.lastGeneratedHeight,
      isBanned: asset.isBanned,
      reportMisbehaviorHeights: JSON.stringify(asset.reportMisbehaviorHeights),
      consecutiveMissedBlocks: asset.consecutiveMissedBlocks,
      commission: asset.commission,
      lastCommissionIncreaseHeight: asset.lastCommissionIncreaseHeight,
      sharingCoefficients: JSON.stringify(asset.sharingCoefficients),
    }));

    return this.prisma.validator.createMany({
      data: validatorsInput,
    });
  }
}
