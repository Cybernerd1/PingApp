/**
 * Socket.IO client for the v1 chat gateway (pingbckd/src/socket/chat.socket.js).
 *
 * Server contract (client → server):
 *   join_chat { chatId } · send_message { chatId, content, message_type, media_url }
 *   typing { chatId } · stop_typing { chatId } · message_read { chatId }
 * Server → client:
 *   chat_joined · new_message { message } · message_status · user_typing · user_stop_typing
 *   presence_update · match_created · error { code, message }
 *
 * Auth: raw access token in handshake.auth.token (NOT "Bearer …").
 * The token is read on every (re)connect so refreshed tokens are picked up.
 */
import { io, Socket } from 'socket.io-client';
import { ENV } from '../config/env';
import { tokenStore } from '../session/tokenStore';
import { ChatMessage } from '../api/types';

export interface ServerEvents {
  new_message: { message: ChatMessage };
  message_status: { chat_id: string; status: 'delivered' | 'read'; message_id?: string };
  user_typing: { user_id: string; chat_id: string };
  user_stop_typing: { user_id: string; chat_id: string };
  presence_update: { user_id: string; online: boolean; last_seen?: string };
  match_created: {
    match: { id: string; status: string; created_at: string };
    chat: { id: string; status: string; created_at: string };
    matched_user_id: string;
  };
  chat_joined: { chat_id: string };
  error: { code: string; message: string };
  connection: { connected: boolean };
}

type Handler<K extends keyof ServerEvents> = (payload: ServerEvents[K]) => void;

const SERVER_EVENTS: (keyof ServerEvents)[] = [
  'new_message',
  'message_status',
  'user_typing',
  'user_stop_typing',
  'presence_update',
  'match_created',
  'chat_joined',
  'error',
];

class RealtimeClient {
  private socket: Socket | null = null;
  private listeners = new Map<keyof ServerEvents, Set<(p: any) => void>>();
  private joined = new Set<string>();

  get connected() {
    return !!this.socket?.connected;
  }

  connect() {
    if (this.socket) {
      if (!this.socket.connected) this.socket.connect();
      return;
    }
    if (!tokenStore.getAccess()) return;

    const socket = io(ENV.BACKEND_URL, {
      transports: ['websocket'],
      auth: cb => cb({ token: tokenStore.getAccess() }),
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 10_000,
      timeout: 60_000, // Render cold start
    });

    socket.on('connect', () => {
      // Re-join rooms after a reconnect.
      this.joined.forEach(chatId => socket.emit('join_chat', { chatId }));
      this.emit('connection', { connected: true });
    });
    socket.on('disconnect', () => this.emit('connection', { connected: false }));
    socket.on('connect_error', () => this.emit('connection', { connected: false }));

    SERVER_EVENTS.forEach(ev => socket.on(ev as string, (payload: any) => this.emit(ev, payload)));
    this.socket = socket;
  }

  disconnect() {
    this.joined.clear();
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
  }

  on<K extends keyof ServerEvents>(event: K, handler: Handler<K>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  }

  private emit<K extends keyof ServerEvents>(event: K, payload: ServerEvents[K]) {
    this.listeners.get(event)?.forEach(fn => fn(payload));
  }

  joinChat(chatId: string) {
    this.joined.add(chatId);
    this.connect();
    this.socket?.emit('join_chat', { chatId });
  }

  leaveChat(chatId: string) {
    this.joined.delete(chatId);
  }

  /** Returns false if the socket isn't connected (caller should show an error). */
  sendMessage(chatId: string, content: string, messageType: 'text' | 'image' | 'voice' = 'text', mediaUrl?: string) {
    if (!this.socket?.connected) return false;
    this.socket.emit('send_message', { chatId, content, message_type: messageType, media_url: mediaUrl });
    return true;
  }

  typing(chatId: string) {
    this.socket?.emit('typing', { chatId });
  }

  stopTyping(chatId: string) {
    this.socket?.emit('stop_typing', { chatId });
  }

  markRead(chatId: string) {
    this.socket?.emit('message_read', { chatId });
  }
}

export const realtime = new RealtimeClient();
