import { Injectable } from '@nestjs/common';
import { ChainEvent } from './chainEvent.interface';
import { Block } from '../interfaces/block.interface';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { TransactionEvents } from 'src/transaction/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChainEventIndexService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  public async indexChainEvents(blocks: Block[]): Promise<ChainEvent[]> {
    const decodedChainEvents = await this.decodeChainEvents(blocks);
    const accounts = await this.getAccountsFromChainEvents(decodedChainEvents);
    await this.writeAccountsToDb(accounts);

    return decodedChainEvents;
  }

  private async decodeChainEvents(blocks: Block[]): Promise<ChainEvent[]> {
    const chainEventPromise = blocks.map(async (block) => {
      const chainEvents = await this.nodeApi.invokeApi<ChainEvent[]>(NodeApi.CHAIN_GET_EVENTS, {
        height: block.header.height,
      });

      return chainEvents.map((e) => {
        e.data = this.decodeData(e);
        e.topics = JSON.stringify(e.topics);
        e.transactionID = this.getTransactionId(e.topics);
        return e;
      });
    });

    return (await Promise.all(chainEventPromise)).flat();
  }

  private async getAccountsFromChainEvents(chainEvents: ChainEvent[]) {
    const accounts = chainEvents
      .filter((e) => e.name === 'initializeUserAccount')
      .map((e) => {
        return { address: JSON.parse(e.data as string)['address'] };
      });

    return accounts;
  }

  public async writeChainEventsToDb(events: ChainEvent[]) {
    await this.prisma.chainEvents.createMany({
      data: events as Prisma.ChainEventsCreateManyInput[],
    });

    // ! probably handle events first before emitting
    // events.forEach(async (e) => {
    //   await this.eventService.pushToGeneralEventQ({
    //     //TODO: Fix this type, dont know a clean solution yet
    //     event: `${e.module}:${e.name}` as any,
    //     payload: e,
    //   });
    // });
  }

  private async writeAccountsToDb(accounts: { address: string }[]) {
    if (accounts.length > 0) return;
    for await (const { address } of accounts) {
      await this.prisma.account.upsert({
        where: { address },
        update: {},
        create: { address },
      });
    }
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
    const data = this.nodeApi.decodeEventData(event.module, event.name, event.data as string);
    return JSON.stringify(data);
  }
}
