import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fastq from 'fastq';
import type { queueAsPromised } from 'fastq';
import { Block } from 'src/node-api/types';

export enum Events {
  NEW_BLOCK_EVENT = 'new.block.event',
}

interface GeneralEvent {
  event: string;
  message: any;
  hash?: string;
}

// Will push all events to the an event queue
// Worker will emit the events in order through the eventEmitter
@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private generalEventMap = new Map();
  private blockEventQ: queueAsPromised<Block>;
  private generalQ: queueAsPromised<GeneralEvent>;

  constructor(private eventEmitter: EventEmitter2) {
    this.blockEventWorker = this.blockEventWorker.bind(this);
    this.blockEventQ = fastq.promise(this.blockEventWorker, 1);
  }

  async pushToBlockEventQ(block: Block) {
    this.blockEventQ.push(block).catch((err) => this.logger.error(err));
  }

  async pushToGeneralEventQ(event: GeneralEvent) {
    // hash event
    // check if event exists
    // set event to map if not
    this.generalQ.push(event).catch((err) => this.logger.error(err));
  }

  // No need for a try-catch block, fastq handles errors automatically
  private async blockEventWorker(block: Block): Promise<void> {
    this.logger.debug(`Worker: New block event for ${block.header.height}`);
    this.eventEmitter.emit(Events.NEW_BLOCK_EVENT, block);
  }
  private async generalEventWorker({ event, message }): Promise<void> {
    this.eventEmitter.emit(event, message);
    // delete event from map
  }
}
