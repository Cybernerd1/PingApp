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
import { SETTINGS_KEY, feedKey } from '../../cache/queryClient';
import type { FeedFilters } from '../../cache/queryClient';
import { DiscoverCandidate, LocationCoordinates, SwipeAction } from '../../api/types';
import { preferencesApi } from '../../api/preferences';
import { ensureLocationReady } from '../../native/location';

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
  /** Change the coarse location segment used by the feed cache key. */
  updateLocation: (coords: LocationCoordinates) => void;
  swipe: (c: DiscoverCandidate, action: SwipeAction) => Promise<void>;
  canRewind: boolean;
  rewind: () => Promise<void>;
  lastMatch: MatchEvent | null;
  clearMatch: () => void;
  notice: string | null;
  clearNotice: () => void;
}

const Ctx = createContext<DeckValue | null>(null);
const BATCH = 30;
/** Start prefetching the next batch when this many cards remain. */
const REFILL_AT = 5;

const DEFAULT_FILTERS: FeedFilters = {
  interested_in: ['everyone'],
  min_age: 18,
  max_age: 100,
  max_distance_km: 20000,
};

const locationBucketFor = (coords: LocationCoordinates): string =>
  `${coords.latitude.toFixed(2)},${coords.longitude.toFixed(2)}`;

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const qc = useQueryClient();
  const settings = useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: async () => unwrap(await preferencesApi.getPreferences()),
    staleTime: 30 * 60_000,
    meta: { persist: true },
  });
  const [locationBucket, setLocationBucket] = useState('unknown');
  const fetchDeck = useCallback(async () => unwrap(await discoverApi.getDiscoverStack(BATCH)).users, []);
  const filters = useMemo<FeedFilters>(() => {
    const value = settings.data;
    if (!value) return DEFAULT_FILTERS;
    return {
      interested_in: [...value.interested_in].sort(),
      min_age: value.min_age,
      max_age: value.max_age,
      max_distance_km: value.max_distance_km,
    };
  }, [settings.data]);
  const queryKey = useMemo(() => feedKey(filters, locationBucket), [filters, locationBucket]);

  const query = useQuery({
    queryKey,
    queryFn: fetchDeck,
    staleTime: 5 * 60_000,
    // Persisted: dehydrated to the encrypted disk store by <CacheGate/>.
    meta: { persist: true },
  });

  const [queue, setQueue] = useState<DiscoverCandidate[]>([]);
  const [history, setHistory] = useState<{ c: DiscoverCandidate; action: SwipeAction }[]>([]);
  const [lastMatch, setLastMatch] = useState<MatchEvent | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const swiped = useRef(new Set<string>());
  /** Mirrors `queue` so async callbacks (swipe) never read a stale closure. */
  const queueRef = useRef<DiscoverCandidate[]>([]);
  queueRef.current = queue;
  const fetchingRef = useRef(query.isFetching);
  fetchingRef.current = query.isFetching;

  useEffect(() => {
    ensureLocationReady().then(coords => {
      if (coords) setLocationBucket(locationBucketFor(coords));
    });
  }, []);

  /**
   * Fetch the next server-side batch. Deduped: skipped while a fetch is already
   * in flight, and react-query itself dedupes concurrent prefetches per key.
   */
  const prefetchNextBatch = useCallback(() => {
    if (fetchingRef.current) return;
    qc.prefetchQuery({ queryKey, queryFn: fetchDeck, staleTime: 0 }).catch(() => undefined);
  }, [qc, queryKey, fetchDeck]);

  // Merge each fetched batch into the queue, deduping by user_id (a refetched
  // batch can overlap with cards still in the local queue) and skipping
  // anything already swiped locally.
  useEffect(() => {
    if (!query.data) return;
    setQueue(prev => {
      const have = new Set(prev.map(c => c.user_id));
      const fresh = query.data.filter(c => !have.has(c.user_id) && !swiped.current.has(c.user_id));
      return [...prev, ...fresh];
    });
  }, [query.data]);

  // Running low on cards → bring in the next batch (only once data has been
  // seen; a pool that returned < BATCH is exhausted, don't spin on it).
  useEffect(() => {
    if (queue.length < REFILL_AT && query.data && query.data.length >= BATCH) prefetchNextBatch();
  }, [queue.length, query.data, prefetchNextBatch]);

  const swipe = useCallback(
    async (c: DiscoverCandidate, action: SwipeAction) => {
      swiped.current.add(c.user_id);
      setQueue(prev => prev.filter(x => x.user_id !== c.user_id));
      queueRef.current = queueRef.current.filter(x => x.user_id !== c.user_id);
      // Remove the card from the persisted/in-memory feed immediately too.
      qc.setQueryData<DiscoverCandidate[]>(queryKey, old => old?.filter(x => x.user_id !== c.user_id));
      const res = await interactionsApi.swipe({ user_id: c.user_id, action });
      if (res.status === 'error') {
        const http = res.httpStatus;
        // Definitive rejections — the server now rejects this profile
        // (deleted 404/410, blocked 403, already swiped 409): silently skip to
        // the next profile, no card return, no notice, no crash.
        if (http === 403 || http === 404 || http === 409 || http === 410) return;
        // Everything else is transient (429 rate limit / network / 5xx): put
        // the card back so the swipe isn't silently lost and explain why.
        swiped.current.delete(c.user_id);
        setQueue(prev => (prev.some(x => x.user_id === c.user_id) ? prev : [c, ...prev]));
        if (!queueRef.current.some(x => x.user_id === c.user_id)) queueRef.current = [c, ...queueRef.current];
        setNotice(res.code === 'RATE_LIMIT_EXCEEDED' ? 'Slow down a little — try again in a minute.' : res.message);
        return;
      }
      // The swipe is now recorded server-side — only safe point to prefetch,
      // so the next batch is guaranteed to exclude this user.
      setHistory(h => [...h.slice(-9), { c, action }]);
      if (res.data.is_match) {
        setLastMatch({ candidate: c, chatId: res.data.chat?.id ?? null, matchId: res.data.match?.id ?? null });
        qc.invalidateQueries({ queryKey: ['matches'] });
        qc.invalidateQueries({ queryKey: ['conversations'] });
      }
      if (queueRef.current.length < REFILL_AT) prefetchNextBatch();
    },
    [qc, queryKey, prefetchNextBatch],
  );

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
    qc.invalidateQueries({ queryKey });
  }, [qc, queryKey]);

  const reset = useCallback(() => {
    setQueue([]);
    setHistory([]);
    swiped.current.clear();
    qc.invalidateQueries({ queryKey });
  }, [qc, queryKey]);

  const updateLocation = useCallback((coords: LocationCoordinates) => {
    setQueue([]);
    setHistory([]);
    swiped.current.clear();
    setLocationBucket(locationBucketFor(coords));
  }, []);

  const value = useMemo<DeckValue>(
    () => ({
      queue,
      loading: query.isLoading || (query.isFetching && queue.length === 0),
      error: query.isError ? (query.error as Error).message : null,
      refresh,
      reset,
      updateLocation,
      swipe,
      canRewind: history.length > 0,
      rewind,
      lastMatch,
      clearMatch: () => setLastMatch(null),
      notice,
      clearNotice: () => setNotice(null),
    }),
    [queue, query.isLoading, query.isFetching, query.isError, query.error, refresh, reset, updateLocation, swipe, history.length, rewind, lastMatch, notice],
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
