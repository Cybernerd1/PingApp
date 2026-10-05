import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  icon: string;
  at: number;
  read: boolean;
  chatId?: string;
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

/** In-app notification inbox (fed by realtime events and foreground pushes). */
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const add = useCallback<Ctx['add']>(n => {
    setItems(prev =>
      [{ ...n, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: Date.now(), read: false }, ...prev].slice(0, 50),
    );
  }, []);
  const markAllRead = useCallback(() => setItems(prev => prev.map(i => ({ ...i, read: true }))), []);
  const clear = useCallback(() => setItems([]), []);
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
