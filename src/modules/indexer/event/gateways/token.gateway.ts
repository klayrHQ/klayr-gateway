import { ChainEvent } from 'src/modules/indexer/interfaces/chain-event.interface';
import { EventGateway } from './event.gateway';
import { ExecutionResultCommand } from '../commands/execution-result.command';

export enum TokenEventTypes {
  TOKEN_COMMAND_EXECUTION_RESULT = 'token:commandExecutionResult',
}

export class TokenCommandExecutionResult extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    await this.commandBus.execute(new ExecutionResultCommand(event));
  }
}
