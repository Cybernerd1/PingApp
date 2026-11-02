/**
 * App-wide TanStack Query client + platform wiring.
 *
 * Used by <CacheGate/> (src/cache/CacheProvider.tsx) both as a plain
 * QueryClientProvider and as the client persisted into encrypted MMKV storage.
 */
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';
import type { DatingPreferences } from '../api/types';

let NetInfo: any = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch {
  NetInfo = null;
}

/**
 * Bump whenever any persisted query's API response shape changes (or the screen
 * shape it feeds into does). The old persisted cache is discarded on next
 * launch — restore buster — instead of rehydrating incompatible data.
 */
export const CACHE_VERSION = 'v1';

export const ME_KEY = ['me'] as const;
export const SETTINGS_KEY = ['settings'] as const;
export const CONVERSATIONS_KEY = ['conversations'] as const;
/** Prefix for all feed variants. Server excludes swiped/matched/blocked users. */
export const FEED_PREFIX = ['feed'] as const;

export type FeedFilters = Pick<DatingPreferences, 'interested_in' | 'min_age' | 'max_age' | 'max_distance_km'>;

export const feedKey = (filters: FeedFilters, locationBucket: string) =>
  [...FEED_PREFIX, filters, locationBucket] as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
      // Serve cached data when offline, refetch once the network returns.
      networkMode: 'offlineFirst',
      // MUST stay >= the persister maxAge in <CacheGate/> (24 h): the persisted
      // copy of a query lives on disk for maxAge, while the in-memory copy is
      // garbage-collected after gcTime idle. If gcTime were even slightly
      // smaller, an unused query could be evicted while its disk copy still has
      // hours of valid life left — wasting the offline-restore path and causing
      // restore/refetch churn. Keeping them aligned makes both clocks agree.
      gcTime: 24 * 60 * 60 * 1000,
    },
  },
});

// ── onlineManager → NetInfo ───────────────────────────────────────────────
// "Online" = radio connected AND the network is actually usable; a captive
// portal reports isConnected but isInternetReachable = false.
function applyNetState(state: { isConnected: boolean | null; isInternetReachable: boolean | null }): void {
  onlineManager.setOnline(state.isConnected === true && state.isInternetReachable !== false);
}
try {
  NetInfo.addEventListener(applyNetState);
  NetInfo.fetch().then(applyNetState).catch(() => undefined);
} catch (e) {
  console.warn('[cache] NetInfo unavailable:', e);
}

// ── focusManager → AppState ────────────────────────────────────────────────
// Refetch-on-focus (i.e. app foregrounding) uses the same focusManager as web.
AppState.addEventListener('change', status => {
  focusManager.setFocused(status === 'active');
});

// ── Dev-only cache log ─────────────────────────────────────────────────────
// Log fetch lifecycle per query key (filter LogCat/flipper by `[ping:query]`).
// Used to prove no network call fires on tab switches while data is fresh.
if (__DEV__) {
  queryClient.getQueryCache().subscribe(event => {
    const key = JSON.stringify(event.query.queryKey ?? null);
    if (event.type === 'added' || event.type === 'removed') {
      console.log(`[ping:query] ${event.type} ${key}`);
      return;
    }
    if (event.type !== 'updated' || !event.action) return;
    const action = event.action as { type?: string; dataUpdatedAt?: number };
    if (action.type === 'fetch') {
      const mode = event.query.state.fetchStatus === 'paused' ? 'paused(no network)' : 'fetching';
      console.log(`[ping:query] fetch ${key} ${mode}`);
    } else if (action.type === 'success') {
      console.log(`[ping:query] success ${key} network=${action.dataUpdatedAt !== undefined}`);
    } else if (action.type === 'error') {
      console.log(`[ping:query] error ${key}`);
    }
  });
}
