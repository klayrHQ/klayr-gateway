import { Injectable } from '@nestjs/common';
import { ChainEvent } from '../interfaces/chain-event.interface';
import { Block } from '../interfaces/block.interface';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { TransactionEvents } from 'src/modules/transaction/types';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { LokiLogger } from 'nestjs-loki-logger';
import { EventGateway } from './gateways/event.gateway';
import { CommandBus } from '@nestjs/cqrs';
import { eventGatewayMap, eventFilterMap } from './event.config';

@Injectable()
export class EventIndexService {
  private readonly logger = new LokiLogger(EventIndexService.name);
  private eventGateways: Record<string, EventGateway> = {};

  constructor(
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
    private readonly nodeApi: NodeApiService,
  ) {
    this.initializeGateways();
  }

  private initializeGateways() {
    const bus = this.commandBus;
    const api = this.nodeApi;

    Object.keys(eventGatewayMap).forEach((type) => {
      const GatewayClass = eventGatewayMap[type];
      const gatewayInstance = new GatewayClass(bus, api);
      this.registerGateway(type, gatewayInstance);
    });
  }

  public async indexChainEvents(blocks: Block[]): Promise<[ChainEvent[], Map<number, number>]> {
    this.logger.debug(`Indexing chain events for ${blocks.length} blocks`);

    const decodedChainEvents = await this.decodeChainEvents(blocks);
    const accounts = await this.getAccountsFromChainEvents(decodedChainEvents);
    await this.writeAccountsToDb(accounts);

    const eventCountMap = this.createEventCountMap(decodedChainEvents);

    return [decodedChainEvents, eventCountMap];
  }

  public async processChainEvents(chainEvents: ChainEvent[]) {
    const seenAddresses = new Set<string>();

    const filteredEvents = chainEvents.filter((event) => {
      const type = `${event.module}:${event.name}`;
      const filterFunction = eventFilterMap[type];
      return filterFunction ? filterFunction({ event, type, seenAddresses }) : false;
    });

    filteredEvents.forEach((e) => {
      const gateway = this.eventGateways[`${e.module}:${e.name}`];
      if (!gateway) return;
      gateway.processChainEvent(e);
    });
  }

  public createEventCountMap(chainEvents: ChainEvent[]): Map<number, number> {
    const eventCountMap = new Map<number, number>();
    chainEvents.forEach((event) => {
      const height = event.height;
      if (eventCountMap.has(height)) {
        eventCountMap.set(height, eventCountMap.get(height)! + 1);
      } else {
        eventCountMap.set(height, 1);
      }
    });
    return eventCountMap;
  }

  public async writeChainEventsToDb(events: ChainEvent[]) {
    await this.prisma.chainEvents.createMany({
      data: events as Prisma.ChainEventsCreateManyInput[],
    });
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

  private async writeAccountsToDb(accounts: { address: string }[]) {
    if (accounts.length === 0) return;
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

  private registerGateway(chainEvent: string, gateway: EventGateway) {
    this.eventGateways[chainEvent] = gateway;
  }
}
