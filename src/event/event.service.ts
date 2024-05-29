import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fastq from 'fastq';
import type { queueAsPromised } from 'fastq';
import { Asset, Block } from 'src/node-api/types';

export enum Events {
  NEW_BLOCKS_EVENT = 'new.blocks.event',
  NEW_ASSETS_EVENT = 'new.assets.event',
}

export interface BlockEvent {
  event: Events;
  blocks: Block[];
}

export interface AssetsEvent {
  event: Events;
  assets: AssetsWithHeight[];
}

export interface AssetsWithHeight {
  height: number;
  assets: Asset[];
}

interface GeneralEvent {
  event: string;
  message: object;
  hash?: string;
}

// Will push all events to the an event queue
// Worker will emit the events in order through the eventEmitter
@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private generalEventMap = new Map();
  private blockEventQ: queueAsPromised<BlockEvent>;
  private assetEventQ: queueAsPromised<AssetsEvent>;
  private generalQ: queueAsPromised<GeneralEvent>;

  constructor(private eventEmitter: EventEmitter2) {
    this.blockEventWorker = this.blockEventWorker.bind(this);
    this.assetEventWorker = this.assetEventWorker.bind(this);
    this.blockEventQ = fastq.promise(this.blockEventWorker, 1);
    this.assetEventQ = fastq.promise(this.assetEventWorker, 1);
  }

  async pushToBlockEventQ(blockEvent: BlockEvent) {
    this.blockEventQ.push(blockEvent).catch((err) => this.logger.error(err));
  }

  async pushToAssetsEventQ(assetsEvent: AssetsEvent) {
    this.assetEventQ.push(assetsEvent).catch((err) => this.logger.error(err));
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

  private async assetEventWorker(assetsEvent: AssetsEvent): Promise<void> {
    const { event, assets } = assetsEvent;
    this.eventEmitter.emit(event, assets);
  }

  private async generalEventWorker({ event, message }): Promise<void> {
    this.eventEmitter.emit(event, message);
    // delete event from map
  }
}
