import { ChainEvent } from 'src/modules/indexer/interfaces/chain-event.interface';
import { EventGateway } from './event.gateway';
import { ExecutionResultCommand } from '../commands/execution-result.command';
import { UpdateSidechainCommand } from '../commands/update-sidechain.command';
import { ChainAccountUpdateEvent } from '../types';

export enum InteroperabilityEventTypes {
  INTEROPERABILITY_COMMAND_EXECUTION_RESULT = 'interoperability:commandExecutionResult',
  INTEROPERABILITY_CHAIN_ACCOUNT_UPDATED = 'interoperability:chainAccountUpdated',
}

export class InteroperabilityCommandExecutionResult extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    await this.commandBus.execute(new ExecutionResultCommand(event));
  }
}

export class InteroperabilityChainAccountUpdated extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const data = JSON.parse(event.data as string) as ChainAccountUpdateEvent;
    await this.commandBus.execute(new UpdateSidechainCommand(data));
  }
}
