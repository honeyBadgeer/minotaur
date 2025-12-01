import { eventBus } from '@/core/events/EventBus';
import { WSEvents } from './events';
import { WSStates, type WSData, type WSError, type WSTicket } from './types';
import { CoreEvents } from '@/core/events/events';

export interface IWebSocketService {
  connect(session: string): void;
  send(
    message: string,
    successCallback: () => void,
    errorCallback: () => void
  ): void;
  onMessage(callback: (data: any) => void): void;
  onClose(callback: () => void): void;
  disconnect(): void;
}

export type WSStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'OPEN'
  | 'CLOSING'
  | 'ERROR';

export class WebSocketService implements IWebSocketService {
  private ws: WebSocket | null = null;
  private messageCallbacks: Array<(data: any) => void> = [];
  private closeCallbacks: Array<() => void> = [];
  private sessionId: string = '';

  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectInterval: number = 5000;

  private status: WSStatus = 'DISCONNECTED';

  public connect(session: string): void {
    this.sessionId = session;
    this.ws = new WebSocket(`${window.Configs.api}/${session}`);
    this.status = 'CONNECTING';
    this.ws.addEventListener('open', this.handleOpen.bind(this));
    this.ws.addEventListener('message', this.handleMessage.bind(this));
    this.ws.addEventListener('error', this.handleError.bind(this));
    this.ws.addEventListener('close', this.handleClose.bind(this));
  }

  private handleOpen(event: Event): void {
    this.status = 'OPEN';
    eventBus.emit(CoreEvents.Loaded, 'ws');
    console.log('%cWebSocket соединение установлено:', 'color: green', event);
    this.reconnectAttempts = 0;
  }

  private handleMessage(ev: MessageEvent) {
    const data = JSON.parse(ev.data);
    console.log('%c[WS MESSAGE]', 'color: blue', data);
    switch (data.state) {
      case WSStates.OK:
        eventBus.emit(WSEvents.MESSAGE, data as WSData);
        break;
      case WSStates.ERROR:
        eventBus.emit(WSEvents.ERROR, data as WSError);
        eventBus.emit(CoreEvents.AppError, {
          type: 'error',
          data: data as WSError,
        });
        break;
      case WSStates.TICKET:
        const parsed = JSON.parse(atob(data.msg));
        console.log(parsed);
        eventBus.emit(WSEvents.TICKET, {
          state: data.state,
          ...parsed,
        } as WSTicket);
        break;
    }
  }

  private handleError(): void {
    this.status = 'ERROR';
  }

  private handleClose(): void {
    this.status = 'DISCONNECTED';
    this.ws = null;
    this.closeCallbacks.forEach((callback) => callback());

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect(this.sessionId);
      }, this.reconnectInterval);
    }
  }

  public getStatus(): string {
    return this.status;
  }

  public send(
    message: string,
    successCallback?: () => void,
    errorCallback?: () => void
  ): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      successCallback && successCallback();
    } else {
      eventBus.emit(CoreEvents.AppError, {
        type: 'error',
        data: { msg: '3gecb noka3bIBaTb o' },
      });
      errorCallback && errorCallback();
    }
  }

  public onMessage(callback: (data: any) => void): void {
    this.messageCallbacks.push(callback);
  }

  public onClose(callback: () => void): void {
    this.closeCallbacks.push(callback);
  }

  public disconnect(): void {
    if (this.ws) {
      this.status = 'CLOSING';
      this.ws.close();
    }
  }

  public destroy(): void {
    this.messageCallbacks = [];
    this.closeCallbacks = [];
    this.status = 'DISCONNECTED';
    this.ws = null;
  }
}
