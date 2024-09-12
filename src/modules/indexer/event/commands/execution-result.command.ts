// handlers/token-execution-result.handler.ts
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ChainEvent } from 'src/modules/indexer/interfaces/chain-event.interface';
import {
  ExecutionEventData,
  ExecutionStatus,
} from 'src/modules/indexer/interfaces/transaction.interface';

export class ExecutionResultCommand implements ICommand {
  constructor(public readonly payload: ChainEvent) {}
}

@CommandHandler(ExecutionResultCommand)
export class ExecutionResultHandler implements ICommandHandler<ExecutionResultCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ExecutionResultCommand): Promise<void> {
    const { payload } = command;
    const executionStatus =
      payload.data === ExecutionEventData.SUCCESSFUL
        ? ExecutionStatus.SUCCESSFUL
        : ExecutionStatus.FAILED;

    await this.prisma.transaction.update({
      where: { id: payload.transactionID },
      data: { executionStatus },
    });
  }
}
