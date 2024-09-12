import { CommandBus } from '@nestjs/cqrs';
import { ChainEvent } from 'src/modules/indexer/interfaces/chain-event.interface';

export abstract class EventGateway {
  constructor(protected readonly commandBus: CommandBus) {}

  abstract processChainEvent(event: ChainEvent): Promise<void>;
}
