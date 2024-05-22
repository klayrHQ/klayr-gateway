import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from '../../src/event/event.service';
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

  it('should emit event', async () => {
    const blockEvents = newBlockArrayMock;
    for (const block of blockEvents) {
      await service.pushToBlockEventQ(block);
      expect(eventEmitterSpy).toHaveBeenCalledWith('new.block.event', block);
    }
  });
});
