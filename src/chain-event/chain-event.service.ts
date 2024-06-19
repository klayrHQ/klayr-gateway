import { Injectable } from '@nestjs/common';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Block, ChainEvent } from 'src/node-api/types';
import { ChainEventRepoService } from './chain-event-repo.service';
import { ChainEvents } from 'src/event/types';
import { EventService } from 'src/event/event.service';

@Injectable()
export class ChainEventService {
  private events = [];

  constructor(
    private readonly repoService: ChainEventRepoService,
    private readonly nodeApiService: NodeApiService,
    private readonly eventService: EventService,
  ) {}

  public async processChainEvents(blocks: Block[]) {
    for (const block of blocks) {
      // TODO: This function is overloaded, skipping blocks!
      const chainEvents = await this.nodeApiService.invokeApi<ChainEvent[]>(
        NodeApi.CHAIN_GET_EVENTS,
        {
          height: block.header.height,
        },
      );
      if (!chainEvents || chainEvents.length === 0) continue;

      for (const e of chainEvents) {
        // TODO: Fix this, cannot decode commandExecutionResult, not found in pos module error
        if (e.name === 'commandExecutionResult') continue;
        const data = this.nodeApiService.decodeEventData(e.module, e.name, e.data as string);

        await this.eventService.pushToGeneralEventQ({
          event: `${e.module}:${e.name}` as ChainEvents,
          payload: {
            ...e,
            data,
          },
        });

        this.events.push({
          ...e,
          data: JSON.stringify(data),
          topics: JSON.stringify(e.topics),
        });

        // TODO: Hacky temp solution for problem above
        if (this.events.length > 1000) {
          await this.repoService.createEventsBulk(this.events);
          this.events = [];
        }
      }
    }

    await this.repoService.createEventsBulk(this.events);
    this.events = [];
  }
}
