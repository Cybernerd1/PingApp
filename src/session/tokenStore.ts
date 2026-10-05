/**
 * Single source of truth for the v1 JWT pair.
 *
 * - Persisted in Keychain (services/authStorage) — never AsyncStorage.
 * - Cached in memory so the axios interceptor doesn't hit Keychain per request.
 * - Emits 'expired' when a refresh fails so App.tsx can route back to Welcome.
 */
import { saveTokens, getTokens, clearTokens } from './authStorage';

type Listener = () => void;

let accessToken: string | null = null;
let refreshToken: string | null = null;
let hydrated = false;
const expiredListeners = new Set<Listener>();

export const tokenStore = {
  async hydrate(): Promise<boolean> {
    if (!hydrated) {
      const stored = await getTokens();
      accessToken = stored?.accessToken ?? null;
      refreshToken = stored?.refreshToken ?? null;
      hydrated = true;
    }
    return !!accessToken;
  },

  getAccess: () => accessToken,
  getRefresh: () => refreshToken,

  async set(access: string, refresh: string): Promise<void> {
    accessToken = access;
    refreshToken = refresh;
    hydrated = true;
    await saveTokens(access, refresh);
  },

  async clear(): Promise<void> {
    accessToken = null;
    refreshToken = null;
    hydrated = true;
    await clearTokens();
  },

  onExpired(fn: Listener): () => void {
    expiredListeners.add(fn);
    return () => expiredListeners.delete(fn);
  },

  emitExpired() {
    expiredListeners.forEach(fn => fn());
  },
};
