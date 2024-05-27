import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from 'src/event/event.service';
import { Block } from 'src/node-api/types';
import { BlockRepoService } from './block-repo.service';

@Injectable()
export class BlockEventService {
  private readonly logger = new Logger(BlockEventService.name);

  constructor(private blockRepo: BlockRepoService) {}

  @OnEvent(Events.NEW_BLOCKS_EVENT)
  async createBlock(payload: Block[]) {
    this.logger.debug(`Block module: New block event ${payload.at(-1).header.height}`);
    // console.log(payload);

    const createBlockPromises = payload.map((blockInput) =>
      this.blockRepo.createBlocks({
        ...blockInput.header,
        aggregateCommit: {
          create: blockInput.header.aggregateCommit,
        },
      }),
    );

    await this.blockRepo.createBlocksTx(createBlockPromises);

    // emit tx events
    // emit asset event
    // emit event events (chain event)
  }
}

// 100k => 35s
// 3 jaar => 8m block  => 45min
