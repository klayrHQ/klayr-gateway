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
    this.logger.debug('Block module: New block event');

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
}
