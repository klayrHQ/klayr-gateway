import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fastq from 'fastq';
import type { queueAsPromised } from 'fastq';
import { BlockEvent, ChainEvents, GeneralEvent, TxOrAssetEvent } from './types';

// Will push all events to the an event queue
// Worker will emit the events in order through the eventEmitter
@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private generalEventMap = new Map();
  private blockEventQ: queueAsPromised<BlockEvent>;
  private txAndAssetEventQ: queueAsPromised<TxOrAssetEvent>;
  private generalQ: queueAsPromised<GeneralEvent>;

  constructor(private eventEmitter: EventEmitter2) {
    this.blockEventWorker = this.blockEventWorker.bind(this);
    this.txAndAssetEventWorker = this.txAndAssetEventWorker.bind(this);
    this.generalEventWorker = this.generalEventWorker.bind(this);
    this.blockEventQ = fastq.promise(this.blockEventWorker, 1);
    this.txAndAssetEventQ = fastq.promise(this.txAndAssetEventWorker, 1);
    this.generalQ = fastq.promise(this.generalEventWorker, 1);
  }

  async pushToBlockEventQ(blockEvent: BlockEvent) {
    this.blockEventQ.push(blockEvent).catch((err) => this.logger.error(err));
  }

  async pushToTxAndAssetsEventQ(event: TxOrAssetEvent) {
    this.txAndAssetEventQ.push(event).catch((err) => this.logger.error(err));
  }

  // No need for a try-catch block, fastq handles errors automatically
  private async blockEventWorker(blockEvent: BlockEvent): Promise<void> {
    const { event, blocks } = blockEvent;
    this.eventEmitter.emit(event, blocks);
  }

  private async txAndAssetEventWorker(args: TxOrAssetEvent): Promise<void> {
    const { event, payload } = args;
    this.eventEmitter.emit(event, payload);
  }

  async pushToGeneralEventQ(event: GeneralEvent) {
    this.generalQ.push(event).catch((err) => this.logger.error(err));
  }

  private async generalEventWorker(args: GeneralEvent): Promise<void> {
    const { event, payload } = args;
    this.eventEmitter.emit(event, payload);

    // ! for dev
    if (event === ChainEvents.POS_VALIDATOR_REGISTERED) {
      this.logger.warn(`Possibly unhandled tx event emitted ${event}`);
    }
  }
}
