import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventService, Events } from 'src/event/event.service';
import { Block } from 'src/node-api/types';
import { BlockRepoService } from './block-repo.service';

@Injectable()
export class BlockEventService {
  private readonly logger = new Logger(BlockEventService.name);

  constructor(
    private blockRepo: BlockRepoService,
    private eventService: EventService,
  ) {}

  @OnEvent(Events.NEW_BLOCKS_EVENT)
  async createBlock(payload: Block[]) {
    this.logger.debug(`Block module: New block event ${payload.at(-1).header.height}`);
    // this.logger.debug(payload.at(0));
    // console.log(payload);
    // payload.map(({ header }) => console.log(header));

    const createBlockPromises = payload.map((block) =>
      this.blockRepo.createBlocks({
        ...block.header,
        aggregateCommit: {
          create: block.header.aggregateCommit,
        },
      }),
    );

    await this.blockRepo.createBlocksTx(createBlockPromises);

    // const allTransactions = payload.map((block: Block) => ({
    //   height: block.header.height,
    //   transactions: block.transactions,
    // }));

    const allAssets = payload.map((block: Block) => ({
      height: block.header.height,
      assets: block.assets,
    }));

    this.eventService.pushToAssetsEventQ({
      event: Events.NEW_ASSETS_EVENT,
      assets: allAssets,
    });
    // emit asset event
    // emit tx events
    // emit event events (chain event)
  }
}

// 100k => 35s
// 3 jaar => 8m block  => 45min
