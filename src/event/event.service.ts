import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fastq from 'fastq';
import type { queueAsPromised } from 'fastq';
import { Block } from 'src/node-api/types';

export enum Events {
  NEW_BLOCK_EVENT = 'new.block.event',
}

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private blockEventQ: queueAsPromised<Block>;

  constructor(private eventEmitter: EventEmitter2) {
    this.blockEventWorker = this.blockEventWorker.bind(this);
    this.blockEventQ = fastq.promise(this.blockEventWorker, 1);
  }

  async pushToBlockEventQ(block: Block) {
    this.blockEventQ.push(block).catch((err) => this.logger.error(err));
  }

  // No need for a try-catch block, fastq handles errors automatically
  private async blockEventWorker(block: Block): Promise<void> {
    this.logger.debug(`Worker: New block event for ${block.header.height}`);
    this.eventEmitter.emit(Events.NEW_BLOCK_EVENT, block);
  }
}
