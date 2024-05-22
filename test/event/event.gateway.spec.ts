import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { EventGateway } from 'src/event/event.gateway';
import { Events } from 'src/event/event.service';
import { newBlockArrayMock } from 'test/mock-values/node-api-mocks';

describe('EventGateway', () => {
  let gateway: EventGateway;
  let server: Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventGateway],
    }).compile();

    gateway = module.get<EventGateway>(EventGateway);
    server = { emit: jest.fn() } as any;
    gateway.server = server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should emit new block event', () => {
    const mockNewEventBlock = newBlockArrayMock[0];
    gateway.emitNewBlockEvent(mockNewEventBlock);
    expect(server.emit).toHaveBeenCalledWith(Events.NEW_BLOCK_EVENT, mockNewEventBlock);
  });
});
