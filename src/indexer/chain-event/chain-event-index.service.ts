import { Injectable } from '@nestjs/common';
import { ChainEvent } from '../interfaces/chain-event.interface';
import { Block } from '../interfaces/block.interface';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { TransactionEvents } from 'src/transaction/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  ChainEventGateway,
  ChainEventTypes,
  ValidatorBanned,
  ValidatorCommissionChange,
  ValidatorPunished,
  ValidatorRegistered,
  ValidatorStaked,
} from './chain-event-pos.gateway';
import { ValidatorEventService } from './validator/validator-event.service';
import { LokiLogger } from 'nestjs-loki-logger';

@Injectable()
export class ChainEventIndexService {
  private readonly logger = new LokiLogger(ChainEventIndexService.name);
  private chainEventGateways: Record<string, ChainEventGateway> = {};

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
    private readonly validatorEventService: ValidatorEventService,
  ) {
    this.initializeGateways();
  }

  private initializeGateways() {
    const s = this.validatorEventService;
    this.registerGateway(ChainEventTypes.POS_VALIDATOR_REGISTERED, new ValidatorRegistered(s));
    this.registerGateway(ChainEventTypes.POS_VALIDATOR_STAKED, new ValidatorStaked(s));
    this.registerGateway(ChainEventTypes.POS_COMMISSION_CHANGE, new ValidatorCommissionChange(s));
    this.registerGateway(ChainEventTypes.POS_VALIDATOR_BANNED, new ValidatorBanned(s));
    this.registerGateway(ChainEventTypes.POS_VALIDATOR_PUNISHED, new ValidatorPunished(s));
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
    chainEvents.forEach((e) => {
      const gateway = this.chainEventGateways[`${e.module}:${e.name}`];
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

  private registerGateway(chainEvent: ChainEventTypes, gateway: ChainEventGateway) {
    this.chainEventGateways[chainEvent] = gateway;
  }
}
