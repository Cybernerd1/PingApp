import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const STORAGE_KEY = 'ping.notifications.v1';
const MAX_ITEMS = 200;

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  icon: string;
  at: number;
  read: boolean;
  chatId?: string;
  avatarUrl?: string;
  /** What triggered it — decides where a tap lands (profile vs chat). */
  kind?: 'message' | 'match' | 'like';
  /** The other user in the notification (for opening their profile). */
  userId?: string;
}

interface Ctx {
  items: AppNotification[];
  unread: number;
  add: (n: Omit<AppNotification, 'id' | 'at' | 'read'>) => void;
  markAllRead: () => void;
  clear: () => void;
  sheetOpen: boolean;
  setSheetOpen: (v: boolean) => void;
}

const NotificationsContext = createContext<Ctx | null>(null);

/** Wipe the saved inbox (called on logout / session expiry so the next account
 *  never sees previous user's notifications). */
export function clearStoredNotifications(): void {
  AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
}

/** In-app notification inbox (fed by realtime events and foreground pushes). */
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const loaded = useRef(false);

  // Restore saved notifications (merge with any that arrived during load).
  const restore = useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        const saved: AppNotification[] = raw ? JSON.parse(raw) : [];
        setItems(prev => {
          const ids = new Set(prev.map(p => p.id));
          return [...prev, ...saved.filter(s => !ids.has(s.id))].sort((a, b) => b.at - a.at).slice(0, MAX_ITEMS);
        });
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
      });
  }, []);

  useEffect(() => {
    restore();
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') restore();
    });
    return () => sub.remove();
  }, [restore]);

  // Persist on every change (only after the initial load so we never overwrite saved data).
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, [items]);

  const add = useCallback<Ctx['add']>(n => {
    setItems(prev =>
      [{ ...n, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: Date.now(), read: false }, ...prev].slice(0, MAX_ITEMS),
    );
  }, []);
  const markAllRead = useCallback(() => setItems(prev => prev.map(i => ({ ...i, read: true }))), []);
  const clear = useCallback(() => {
    clearStoredNotifications();
    setItems([]);
  }, []);
  const value = useMemo(
    () => ({ items, unread: items.filter(i => !i.read).length, add, markAllRead, clear, sheetOpen, setSheetOpen }),
    [items, add, markAllRead, clear, sheetOpen],
  );
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = (): Ctx => {
  const c = useContext(NotificationsContext);
  if (!c) throw new Error('useNotifications must be used inside NotificationsProvider');
  return c;
};
