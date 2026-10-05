/**
 * Shared discover deck for Home (swipe) and Nearby (grid).
 *
 * GET  /discover?limit=30            — server already excludes swiped / matched / blocked users
 * POST /interactions {user_id, action} — like | dislike, 201 + chat on mutual like
 * DELETE /interactions/{likes|dislikes}/{id} — rewind
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { discoverApi } from '../../api/discover';
import { interactionsApi } from '../../api/interactions';
import { unwrap } from '../../api/client';
import { DiscoverCandidate, SwipeAction } from '../../api/types';

export interface MatchEvent {
  candidate: DiscoverCandidate;
  chatId: string | null;
  matchId: string | null;
}

interface DeckValue {
  queue: DiscoverCandidate[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  /** Drop the local queue and refetch (after preferences / location change). */
  reset: () => void;
  swipe: (c: DiscoverCandidate, action: SwipeAction) => Promise<void>;
  canRewind: boolean;
  rewind: () => Promise<void>;
  lastMatch: MatchEvent | null;
  clearMatch: () => void;
  notice: string | null;
  clearNotice: () => void;
}

const Ctx = createContext<DeckValue | null>(null);
const DECK_KEY = ['discover'];
const BATCH = 30;
const REFILL_AT = 4;

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: DECK_KEY,
    queryFn: async () => unwrap(await discoverApi.getDiscoverStack(BATCH)).users,
    staleTime: 5 * 60_000,
  });

  const [queue, setQueue] = useState<DiscoverCandidate[]>([]);
  const [history, setHistory] = useState<{ c: DiscoverCandidate; action: SwipeAction }[]>([]);
  const [lastMatch, setLastMatch] = useState<MatchEvent | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const swiped = useRef(new Set<string>());

  // Merge each fetched batch into the queue (skip anything already handled).
  useEffect(() => {
    if (!query.data) return;
    setQueue(prev => {
      const have = new Set(prev.map(c => c.user_id));
      const fresh = query.data.filter(c => !have.has(c.user_id) && !swiped.current.has(c.user_id));
      return [...prev, ...fresh];
    });
  }, [query.data]);

  // Top up when running low.
  useEffect(() => {
    if (queue.length < REFILL_AT && !query.isFetching && query.data && query.data.length >= BATCH) {
      qc.invalidateQueries({ queryKey: DECK_KEY });
    }
  }, [queue.length, query.isFetching, query.data, qc]);

  const swipe = useCallback(async (c: DiscoverCandidate, action: SwipeAction) => {
    swiped.current.add(c.user_id);
    setQueue(prev => prev.filter(x => x.user_id !== c.user_id));
    const res = await interactionsApi.swipe({ user_id: c.user_id, action });
    if (res.status === 'error') {
      // Put the card back so the swipe isn't silently lost.
      swiped.current.delete(c.user_id);
      setQueue(prev => [c, ...prev]);
      setNotice(res.code === 'RATE_LIMIT_EXCEEDED' ? 'Slow down a little — try again in a minute.' : res.message);
      return;
    }
    setHistory(h => [...h.slice(-9), { c, action }]);
    if (res.data.is_match) {
      setLastMatch({ candidate: c, chatId: res.data.chat?.id ?? null, matchId: res.data.match?.id ?? null });
      qc.invalidateQueries({ queryKey: ['matches'] });
      qc.invalidateQueries({ queryKey: ['chats'] });
    }
  }, [qc]);

  const rewind = useCallback(async () => {
    const last = history[history.length - 1];
    if (!last) return;
    const res =
      last.action === 'like'
        ? await interactionsApi.undoLike(last.c.user_id)
        : await interactionsApi.undoDislike(last.c.user_id);
    if (res.status === 'error') {
      setNotice(res.code === 'NOT_FOUND' ? 'That one can’t be undone anymore.' : res.message);
      setHistory(h => h.slice(0, -1));
      return;
    }
    setHistory(h => h.slice(0, -1));
    swiped.current.delete(last.c.user_id);
    setQueue(prev => [last.c, ...prev.filter(x => x.user_id !== last.c.user_id)]);
  }, [history]);

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: DECK_KEY });
  }, [qc]);

  const reset = useCallback(() => {
    setQueue([]);
    setHistory([]);
    qc.invalidateQueries({ queryKey: DECK_KEY });
  }, [qc]);

  const value = useMemo<DeckValue>(
    () => ({
      queue,
      loading: query.isLoading || (query.isFetching && queue.length === 0),
      error: query.isError ? (query.error as Error).message : null,
      refresh,
      reset,
      swipe,
      canRewind: history.length > 0,
      rewind,
      lastMatch,
      clearMatch: () => setLastMatch(null),
      notice,
      clearNotice: () => setNotice(null),
    }),
    [queue, query.isLoading, query.isFetching, query.isError, query.error, refresh, reset, swipe, history.length, rewind, lastMatch, notice],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useDeck(): DeckValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDeck must be used inside <DeckProvider>');
  return v;
}

/** "Leslie, 28" with nulls handled. */
export const nameAge = (c: { full_name: string; age: number | null }) =>
  c.age ? `${c.full_name.split(' ')[0]} ${c.age}` : c.full_name.split(' ')[0];

/** "0.9 km away" / "Nearby". */
export const distanceLabel = (km: number | null | undefined) =>
  km == null ? 'Nearby' : km < 1 ? 'Less than 1 km away' : `${km < 10 ? km.toFixed(1) : Math.round(km)} km away`;
