import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from 'src/event/event.service';
import { Block } from 'src/node-api/types';
import { BlockRepoService } from './block-repo.service';

@Injectable()
export class BlockEventService {
  private readonly logger = new Logger(BlockEventService.name);

  constructor(private blockRepo: BlockRepoService) {}

  // TODO: ADD AGGREGATE COMMIT
  @OnEvent(Events.NEW_BLOCK_EVENT)
  async createBlock(payload: Block) {
    this.logger.debug(`Block module: New block event ${payload.header.height}`);
    // console.log(payload);

    await this.blockRepo.createBlock({
      ...payload.header,
      aggregateCommit: {
        create: payload.header.aggregateCommit,
      },
    });

    // emit tx events
    // emit asset event
    // emit event events (chain event)
  }

  @OnEvent(Events.NEW_BATCH_BLOCK_EVENT)
  async createBatchBlock(payload: Block[]) {
    this.logger.debug(`Block module: New block event ${payload.at(-1).header.height}`);
    // console.log(payload);

    const createBlockPromises = payload.map((blockInput) =>
      this.blockRepo.createBlockPromises({
        ...blockInput.header,
        aggregateCommit: {
          create: blockInput.header.aggregateCommit,
        },
      }),
    );

    await this.blockRepo.createBlocks(createBlockPromises);

    // emit tx events
    // emit asset event
    // emit event events (chain event)
  }
}
// 1000 => 22s
// 5000 => 16s
// 100k => 35s

// 3 jaar => 8m block  => 45min
