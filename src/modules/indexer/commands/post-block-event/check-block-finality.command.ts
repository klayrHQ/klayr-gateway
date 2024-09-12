import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { NodeApiService } from 'src/modules/node-api/node-api.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export class CheckForBlockFinalityCommand {}

@CommandHandler(CheckForBlockFinalityCommand)
export class CheckForBlockFinalityHandler implements ICommandHandler<CheckForBlockFinalityCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  async execute() {
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
