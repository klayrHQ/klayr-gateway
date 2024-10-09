import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { CONNECTION_TIMEOUT, RESPONSE_TIMEOUT } from 'src/utils/constants';
import { WebSocket } from 'ws';
import { Defer, JSONRPCMessage } from './websocket.interface';
import {
  convertRPCError,
  defer,
  messageIsNotification,
  promiseWithTimeout,
} from './websocket-utils';
import { EventEmitter2 } from '@nestjs/event-emitter';

export enum WebSocketState {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Injectable()
export class WebSocketClientService implements OnModuleDestroy {
  private readonly logger = new Logger(WebSocketClientService.name);
  private ws: WebSocket;
  private reconnectInterval: number = CONNECTION_TIMEOUT;
  private requestCounter: number = 0;
  private pendingRequests: {
    [key: number]: Defer<unknown>;
  } = {};

  constructor(private readonly emitter: EventEmitter2) {}

  async onModuleInit() {
    this.logger.log('WebSocketClientService initialized');
    this.connect();
    while (this.ws.readyState !== WebSocket.OPEN) {
      this.logger.log('Waiting for connection');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  private connect() {
    this.ws = new WebSocket(process.env.NODE_URL);

    this.ws.on('open', () => {
      this.logger.log('WebSocket connection established');
      this.emitter.emit(WebSocketState.OPEN, {});
    });

    this.ws.on('message', (data) => {
      this.handleMessage(data);
    });

    this.ws.on('error', async (error) => {
      this.logger.error(`WebSocket error: ${error.message}`);
      await this.disconnect();
    });

    this.ws.on('close', () => {
      this.logger.warn('WebSocket connection closed');
      this.emitter.emit(WebSocketState.CLOSED, {});
      this.reconnect();
    });
  }

  private reconnect() {
    this.logger.log(`Reconnecting in ${this.reconnectInterval / 1000} seconds...`);
    setTimeout(() => this.connect(), this.reconnectInterval);
  }

  sendMessage(message: string) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.logger.warn('WebSocket is not open. Cannot send message.');
    }
  }

  public async invoke<T = Record<string, unknown>>(
    actionName: string,
    params?: Record<string, unknown>,
  ): Promise<T> {
    if (this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Websocket client is not connected.');
    }

    const request = {
      jsonrpc: '2.0',
      id: this.requestCounter,
      method: actionName,
      params: params ?? {},
    };

    this.ws?.send(JSON.stringify(request));

    const response = defer<T>();
    this.pendingRequests[this.requestCounter] = response as Defer<unknown>;
    this.requestCounter += 1;
    return promiseWithTimeout(
      [response.promise],
      RESPONSE_TIMEOUT,
      `Response not received in ${RESPONSE_TIMEOUT}ms`,
    );
  }

  public subscribe(eventName: string): boolean {
    if (this.ws.readyState !== WebSocket.OPEN) return false;

    const request = {
      jsonrpc: '2.0',
      id: this.requestCounter,
      method: 'subscribe',
      params: {
        topics: [eventName],
      },
    };
    this.requestCounter += 1;
    this.ws?.send(JSON.stringify(request));
    return true;
  }

  public unsubscribe(eventName: string): void {
    const request = {
      jsonrpc: '2.0',
      id: this.requestCounter,
      method: 'unsubscribe',
      params: {
        topics: [eventName],
      },
    };
    this.requestCounter += 1;
    this.ws?.send(JSON.stringify(request));
  }

  private handleMessage(event: any): void {
    const res = JSON.parse(event as string) as JSONRPCMessage<unknown>;

    // Its an event
    if (messageIsNotification(res)) {
      this.emitter.emit(res.method, res.params);

      // Its a response for a request
    } else {
      const id = typeof res.id === 'number' ? res.id : parseInt(res.id as string, 10);

      if (this.pendingRequests[id]) {
        if (res.error) {
          this.pendingRequests[id].reject(convertRPCError(res.error));
        } else {
          this.pendingRequests[id].resolve(res.result);
        }

        delete this.pendingRequests[id];
      }
    }
  }

  public async disconnect(): Promise<void> {
    this.requestCounter = 0;
    this.pendingRequests = {};

    if (!this.ws) return;

    if (this.ws.readyState === WebSocket.CLOSED) {
      this.ws = undefined;
      return;
    }

    const closeHandler = new Promise<void>((resolve) => {
      const onClose = () => {
        this.ws?.removeEventListener('close', onClose);
        resolve();
      };

      this.ws?.addEventListener('close', onClose);
    });

    this.ws.close();
    await promiseWithTimeout(
      [closeHandler],
      CONNECTION_TIMEOUT,
      `Could not disconnect in ${CONNECTION_TIMEOUT}ms`,
    );
  }

  async onModuleDestroy() {
    await this.disconnect();
  }
}
