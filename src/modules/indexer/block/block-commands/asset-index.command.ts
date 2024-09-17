import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Asset, Block } from '../../interfaces/block.interface';
import { AssetTypes } from '../../interfaces/asset.interface';
import { LokiLogger } from 'nestjs-loki-logger';
import { Payload } from 'src/modules/indexer/event/types';

export class IndexAssetCommand implements ICommand {
  constructor(public readonly blocks: Block[]) {}
}

@CommandHandler(IndexAssetCommand)
export class IndexAssetHandler implements ICommandHandler<IndexAssetCommand> {
  private readonly logger = new LokiLogger(IndexAssetHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: IndexAssetCommand): Promise<void> {
    this.logger.debug('Indexing assets...');
    const assets = this.processAssets(command.blocks);

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
