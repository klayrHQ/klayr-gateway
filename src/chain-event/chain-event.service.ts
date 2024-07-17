import { Injectable } from '@nestjs/common';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Block, ChainEvent } from 'src/node-api/types';
import { ChainEventRepoService } from './chain-event-repo.service';
import { ChainEvents } from 'src/event/types';
import { EventService } from 'src/event/event.service';
import { getKlayer32Address, getKlayer32FromPublic } from 'src/utils/helpers';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class ChainEventService {
  private events = [];
  private chainEvents = [];

  constructor(
    private readonly repoService: ChainEventRepoService,
    private readonly nodeApiService: NodeApiService,
    private readonly eventService: EventService,
    private readonly accountService: AccountService,
  ) {}

  public async checkUserAccountsAndSaveEvents(blocks: Block[]) {
    const promises = blocks.map(async (block) => {
      const chainEvents = await this.nodeApiService.invokeApi<ChainEvent[]>(
        NodeApi.CHAIN_GET_EVENTS,
        {
          height: block.header.height,
        },
      );

      const decodedChainEvents = chainEvents
        // TODO: Fix this, cannot decode commandExecutionResult, not found in module error
        .filter((e) => e.name !== 'commandExecutionResult')
        .map((e) => {
          const data = this.nodeApiService.decodeEventData(e.module, e.name, e.data as string);
          e.data = JSON.stringify(data);
          e.topics = JSON.stringify(e.topics);
          return e;
        });
      await this.handleAccounts(decodedChainEvents);

      return decodedChainEvents;
    });

    const events = await Promise.all(promises);
    // ! temp
    for (const e of events) {
      for (const event of e) {
        if (event.name !== 'rewardMinted' && event.name !== 'mint' && event.name !== 'lock') {
          console.log(event.module, event.name);
        }
      }
    }
    //
    this.chainEvents.push(...events.flat());
  }

  public async writeChainEvents() {
    await this.repoService.createEventsBulk(this.chainEvents);
    this.chainEvents = [];
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
}
