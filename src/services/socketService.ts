import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../api/client';

type SocketEventListener = (data: any) => void;

class SocketService {
  private socket: any = null;
  private listeners: Map<string, Set<SocketEventListener>> = new Map();
  private connected: boolean = false;

  public async connect(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) return;

      // Dynamic import to support react-native environment
      const { io } = await import('socket.io-client');
      const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3000';

      this.socket = io(SOCKET_URL, {
        auth: { token: `Bearer ${token}` },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        this.connected = true;
        this.emitLocal('connection_status', { connected: true });
      });

      this.socket.on('disconnect', () => {
        this.connected = false;
        this.emitLocal('connection_status', { connected: false });
      });

      this.socket.on('receive_message', (data: any) => {
        this.emitLocal('receive_message', data);
      });

      this.socket.on('typing', (data: any) => {
        this.emitLocal('typing', data);
      });

      this.socket.on('read_receipt', (data: any) => {
        this.emitLocal('read_receipt', data);
      });

      this.socket.on('presence_update', (data: any) => {
        this.emitLocal('presence_update', data);
      });
    } catch {
      this.connected = false;
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public sendMessage(chatId: string, content: string, messageType: string = 'text', mediaUrl?: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('send_message', {
        chat_id: chatId,
        content,
        message_type: messageType,
        media_url: mediaUrl,
      });
    }
  }

  public sendTyping(chatId: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('typing', { chat_id: chatId });
    }
  }

  public sendReadReceipt(chatId: string, messageIds: string[]): void {
    if (this.socket && this.connected) {
      this.socket.emit('read_receipt', { chat_id: chatId, message_ids: messageIds });
    }
  }

  public on(event: string, callback: SocketEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emitLocal(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}

export const socketService = new SocketService();
