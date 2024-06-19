import { Injectable } from '@nestjs/common';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Block, ChainEvent } from 'src/node-api/types';
import { ChainEventRepoService } from './chain-event-repo.service';

@Injectable()
export class ChainEventService {
  constructor(
    private readonly repoService: ChainEventRepoService,
    private readonly nodeApiService: NodeApiService,
  ) {}

  public async processChainEvents(blocks: Block[]) {
    const allChainEventsDb = [];

    for (const block of blocks) {
      const chainEvents = await this.nodeApiService.invokeApi<ChainEvent[]>(
        NodeApi.CHAIN_GET_EVENTS,
        {
          height: block.header.height,
        },
      );

      const chainEventsDb = chainEvents
        // TODO: Cannot decode commandExecutionResult for some reason yet (not existing in pos module)
        .filter((e: ChainEvent) => e.name !== 'commandExecutionResult')
        .map((e: ChainEvent) => {
          const data = this.nodeApiService.decodeEventData(e.module, e.name, e.data);

          return {
            ...e,
            data: JSON.stringify(data),
            topics: JSON.stringify(e.topics),
          };
          // TODO: Emit event
        });

      if (chainEventsDb.length > 0) {
        allChainEventsDb.push(...chainEventsDb);
      }
    }

    // TODO: crashing when not working with prisma.transaction here. Solution might be slow?
    await this.repoService.createEventsBulk(allChainEventsDb);
  }
}
