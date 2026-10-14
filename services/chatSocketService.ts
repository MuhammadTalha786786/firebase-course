import {BASE_API_URL} from './services';

export interface ChatMessage {
  _id?: string;
  messageID: string;
  sender: {
    _id: string;
    name: string;
    image?: string;
    uid?: string;
  } | string;
  receiver: {
    _id: string;
    name: string;
    image?: string;
    uid?: string;
  } | string;
  senderID?: string;
  receiverID?: string;
  message: string;
  timeofsend: string;
  createdAt: string | Date;
  isDeleted?: boolean;
  deletedAt?: string | Date;
  isRead?: boolean;
  pending?: boolean;
}

type MessageCallback = (message: ChatMessage) => void;
type DeleteCallback = (data: {messageID: string; deletedAt?: string}) => void;
type TypingCallback = (data: {senderID: string; isTyping: boolean}) => void;
type ConnectionCallback = (isConnected: boolean) => void;

class ChatSocketService {
  private ws: WebSocket | null = null;
  private currentUserId: string | null = null;
  private isExplicitlyClosed = false;
  private reconnectTimer: any = null;
  private reconnectAttempts = 0;
  private messageListeners: Set<MessageCallback> = new Set();
  private deleteListeners: Set<DeleteCallback> = new Set();
  private typingListeners: Set<TypingCallback> = new Set();
  private connectionListeners: Set<ConnectionCallback> = new Set();

  public getWsUrl(): string {
    const cleanUrl = BASE_API_URL.trim().replace(/\/$/, '');
    const wsProtocol = cleanUrl.startsWith('https') ? 'wss' : 'ws';
    const host = cleanUrl.replace(/^https?:\/\//, '');
    return `${wsProtocol}://${host}/ws`;
  }

  public connect(userId: string) {
    if (!userId) return;
    this.currentUserId = userId;
    this.isExplicitlyClosed = false;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      this.identify(userId);
      return;
    }

    try {
      const url = this.getWsUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.notifyConnectionChange(true);
        this.identify(this.currentUserId!);
      };

      this.ws.onmessage = event => {
        try {
          const payload = JSON.parse(event.data);
          this.handleIncomingEvent(payload);
        } catch (e) {
          console.warn('Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onerror = error => {
        console.log('Chat WebSocket error:', error);
      };

      this.ws.onclose = () => {
        this.notifyConnectionChange(false);
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.log('WebSocket init error:', err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.isExplicitlyClosed) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    // Exponential backoff capped at 8 seconds
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 8000);
    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      if (this.currentUserId && !this.isExplicitlyClosed) {
        this.connect(this.currentUserId);
      }
    }, delay);
  }

  private identify(userId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'identify',
          userId,
        }),
      );
    }
  }

  private handleIncomingEvent(data: any) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'new_message':
        if (data.message) {
          this.messageListeners.forEach(cb => cb(data.message));
        }
        break;

      case 'message_deleted':
        this.deleteListeners.forEach(cb =>
          cb({
            messageID: data.messageID,
            deletedAt: data.deletedAt,
          }),
        );
        break;

      case 'typing':
        this.typingListeners.forEach(cb =>
          cb({
            senderID: data.senderID,
            isTyping: !!data.isTyping,
          }),
        );
        break;

      default:
        break;
    }
  }

  public sendMessage(payload: {
    senderID: string;
    receiverID: string;
    message: string;
    messageID: string;
    timeofsend?: string;
  }): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'send_message',
          ...payload,
        }),
      );
      return true;
    }
    return false;
  }

  public deleteMessage(payload: {messageID: string; userID: string}): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'delete_message',
          ...payload,
        }),
      );
      return true;
    }
    return false;
  }

  public sendTyping(payload: {senderID: string; receiverID: string; isTyping: boolean}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'typing',
          ...payload,
        }),
      );
    }
  }

  public addMessageListener(cb: MessageCallback) {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }

  public addDeleteListener(cb: DeleteCallback) {
    this.deleteListeners.add(cb);
    return () => this.deleteListeners.delete(cb);
  }

  public addTypingListener(cb: TypingCallback) {
    this.typingListeners.add(cb);
    return () => this.typingListeners.delete(cb);
  }

  public addConnectionListener(cb: ConnectionCallback) {
    this.connectionListeners.add(cb);
    cb(this.isConnected());
    return () => this.connectionListeners.delete(cb);
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionListeners.forEach(cb => cb(connected));
  }

  public isConnected(): boolean {
    return !!(this.ws && this.ws.readyState === WebSocket.OPEN);
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.notifyConnectionChange(false);
  }
}

export const chatSocketService = new ChatSocketService();
