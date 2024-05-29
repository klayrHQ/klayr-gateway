import { Test, TestingModule } from '@nestjs/testing';
import { EventService, Events } from '../../src/event/event.service';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { newBlockArrayMock } from 'test/mock-values/node-api-mocks';

describe('EventService', () => {
  let service: EventService;
  let eventEmitter: EventEmitter2;
  let eventEmitterSpy: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [EventService],
    }).compile();

    service = module.get<EventService>(EventService);
    eventEmitter = (service as any).eventEmitter;
    eventEmitterSpy = jest.spyOn(eventEmitter, 'emit');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should emit block event', async () => {
    const blockEvents = newBlockArrayMock;
    for (const block of blockEvents) {
      await service.pushToBlockEventQ({ event: Events.NEW_BLOCKS_EVENT, blocks: [block] });
      expect(eventEmitterSpy).toHaveBeenCalledWith('new.blocks.event', [block]);
    }
  });

  it('should emit asset event', async () => {
    const assets = [{ height: 1, assets: [] }];
    await service.pushToAssetsEventQ({ event: Events.NEW_ASSETS_EVENT, assets });
    expect(eventEmitterSpy).toHaveBeenCalledWith('new.assets.event', assets);
  });
});
