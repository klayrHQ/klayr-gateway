import { ChainEvent } from 'src/modules/indexer/interfaces/chain-event.interface';
import { EventGateway } from './event.gateway';
import { ExecutionResultCommand } from '../commands/execution-result.command';
import { TokenTransferEvent, UpdateAccountCommand } from '../commands/update-account.command';

export enum TokenEventTypes {
  TOKEN_COMMAND_EXECUTION_RESULT = 'token:commandExecutionResult',
  TOKEN_TRANSFER = 'token:transfer',
}

export class TokenCommandExecutionResult extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    await this.commandBus.execute(new ExecutionResultCommand(event));
  }
}

export class TokenTransfer extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const transferEvent = JSON.parse(event.data as string) as TokenTransferEvent;
    await this.commandBus.execute(new UpdateAccountCommand(transferEvent));
  }
}
