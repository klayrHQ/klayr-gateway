import { Injectable } from '@nestjs/common';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Block, ChainEvent } from 'src/node-api/types';
import { ChainEventRepoService } from './chain-event-repo.service';
import { EventService } from 'src/event/event.service';
import { AccountService } from 'src/account/account.service';
import { Prisma } from '@prisma/client';
import { TransactionEvents } from 'src/transaction/types';

@Injectable()
export class ChainEventService {
  constructor(
    private readonly repoService: ChainEventRepoService,
    private readonly nodeApiService: NodeApiService,
    private readonly eventService: EventService,
    private readonly accountService: AccountService,
  ) {}

  public async checkUserAccountsAndSaveEvents(blocks: Block[]): Promise<ChainEvent[]> {
    const promises = blocks.map(async (block) => {
      const chainEvents = await this.nodeApiService.invokeApi<ChainEvent[]>(
        NodeApi.CHAIN_GET_EVENTS,
        {
          height: block.header.height,
        },
      );

      const decodedChainEvents = chainEvents.map((e) => {
        e.data = this.decodeData(e);
        e.topics = JSON.stringify(e.topics);
        e.transactionID = this.getTransactionId(e.topics);
        return e;
      });
      await this.handleAccounts(decodedChainEvents);

      return decodedChainEvents;
    });
    const chainEvents = await Promise.all(promises);
    return chainEvents.flat();
  }

  public async writeAndEmitChainEvents(events: ChainEvent[]) {
    await this.repoService.createEventsBulk(events as Prisma.ChainEventsCreateManyInput[]);

    events.forEach(async (e) => {
      await this.eventService.pushToGeneralEventQ({
        //TODO: Fix this type, dont know a clean solution yet
        event: `${e.module}:${e.name}` as any,
        payload: e,
      });
    });
  }

  // TODO: handle accounts for block batch instead of every block itself
  private async handleAccounts(chainEvents: ChainEvent[]) {
    const accounts = chainEvents
      .filter((e) => e.name === 'initializeUserAccount')
      .map((e) => {
        return { address: JSON.parse(e.data as string)['address'] };
      });
    if (accounts.length > 0) await this.accountService.createAccountsBulk(accounts);
  }

  private getTransactionId(topics: string): string | null {
    const parsedTopics = JSON.parse(topics);
    const firstTopic = parsedTopics[0];
    if (firstTopic && firstTopic.startsWith('04')) {
      return firstTopic.substring(2);
    }

    return null;
  }

  private decodeData(event: ChainEvent) {
    if (event.name === TransactionEvents.COMMAND_EXECUTION_RESULT) {
      return event.data;
    }
    const data = this.nodeApiService.decodeEventData(
      event.module,
      event.name,
      event.data as string,
    );
    return JSON.stringify(data);
  }
}
