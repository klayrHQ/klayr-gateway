import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fastq from 'fastq';
import type { queueAsPromised } from 'fastq';
import { Block } from 'src/node-api/types';

export enum Events {
  NEW_BLOCKS_EVENT = 'new.blocks.event',
}

export interface BlockEvent {
  event: Events;
  blocks: Block[];
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
  private blockEventQ: queueAsPromised<BlockEvent>;
  private generalQ: queueAsPromised<GeneralEvent>;

  constructor(private eventEmitter: EventEmitter2) {
    this.blockEventWorker = this.blockEventWorker.bind(this);
    this.blockEventQ = fastq.promise(this.blockEventWorker, 5);
  }

  async pushToBlockEventQ(blockEvent: BlockEvent) {
    this.blockEventQ.push(blockEvent).catch((err) => this.logger.error(err));
  }

  async pushToGeneralEventQ(event: GeneralEvent) {
    // hash event
    // check if event exists
    // set event to map if not
    this.generalQ.push(event).catch((err) => this.logger.error(err));
  }

  // No need for a try-catch block, fastq handles errors automatically
  private async blockEventWorker(blockEvent: BlockEvent): Promise<void> {
    const { event, blocks } = blockEvent;
    this.eventEmitter.emit(event, blocks);
  }
  private async generalEventWorker({ event, message }): Promise<void> {
    this.eventEmitter.emit(event, message);
    // delete event from map
  }
}
