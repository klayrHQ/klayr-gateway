import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { LokiLogger } from 'nestjs-loki-logger';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export class UpdateBlocksFeeCommand {
  constructor(public readonly payload: Map<number, UpdateBlockFee>) {}
}

export interface UpdateBlockFee {
  totalBurnt: number;
  totalFee: number;
}

@CommandHandler(UpdateBlocksFeeCommand)
export class UpdateBlocksFeeHandler implements ICommandHandler<UpdateBlocksFeeCommand> {
  private logger = new LokiLogger(UpdateBlocksFeeHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateBlocksFeeCommand): Promise<void> {
    this.logger.debug('Updating blocks fee');
    if (!command.payload) return;

    for (const [height, { totalBurnt, totalFee }] of command.payload.entries()) {
      const block = await this.prisma.block.findUnique({ where: { height } });
      const networkFee = totalFee - totalBurnt;
      const totalForged = Number(block.reward) + networkFee + totalBurnt;

      await this.prisma.block.update({
        where: {
          height: height,
        },
        data: {
          totalBurnt: totalBurnt,
          networkFee: networkFee,
          totalForged: totalForged,
        },
      });
    }
  }
}
