import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fastq from 'fastq';
import type { queueAsPromised } from 'fastq';
import { NewBlockEvent } from 'src/node-api/types';

enum Events {
  NEW_BLOCK = 'new.block',
}

@Injectable()
export class EventService {
  eventQ: queueAsPromised<NewBlockEvent>;

  constructor(private eventEmitter: EventEmitter2) {
    this.eventWorker = this.eventWorker.bind(this);
    this.eventQ = fastq.promise(this.eventWorker, 1);
  }

  async pushToEventQ(newBlockEvent: NewBlockEvent) {
    this.eventQ.push(newBlockEvent).catch((err) => console.error(err));
  }

  async eventWorker(newBlockEvent: NewBlockEvent): Promise<void> {
    console.log(newBlockEvent.header.height);
    this.eventEmitter.emit(Events.NEW_BLOCK, newBlockEvent);
  }
}
