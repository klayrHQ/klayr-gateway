import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { LokiLogger } from 'nestjs-loki-logger';
import { NodeApiService } from 'src/modules/node-api/node-api.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export class CheckForBlockFinalityCommand {}

@CommandHandler(CheckForBlockFinalityCommand)
export class CheckForBlockFinalityHandler implements ICommandHandler<CheckForBlockFinalityCommand> {
  private logger = new LokiLogger(CheckForBlockFinalityHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  async execute() {
    this.logger.debug('Checking for block finality');
    await this.nodeApi.getAndSetNodeInfo();
    await this.prisma.block.updateMany({
      where: {
        isFinal: false,
        height: {
          lte: this.nodeApi.nodeInfo.finalizedHeight,
        },
      },
      data: {
        isFinal: true,
      },
    });
  }
}
