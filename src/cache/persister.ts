/**
 * Sync persister over the encrypted MMKV store.
 *
 * Created lazily — only after initStorage() has resolved — because MMKV (and its
 * encryption key from the Keychain) is not available at module load time.
 */
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { getStorage } from './storage';

let persister: ReturnType<typeof createSyncStoragePersister> | null = null;

/**
 * The app's persister, or `null` when MMKV is unavailable (boot gate falls back
 * to a plain QueryClientProvider in that case). Idempotent.
 */
export function initPersister(): ReturnType<typeof createSyncStoragePersister> | null {
  if (persister) return persister;
  try {
    const storage = getStorage();
    persister = createSyncStoragePersister({
      // MMKV: instance-level API getString/set/remove (v4).
      storage: {
        getItem: key => storage.getString(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: key => {
          storage.remove(key);
        },
      },
      key: 'ping-query-cache',
      throttleTime: 2000,
    });
  } catch (e) {
    console.warn('[cache] persister unavailable — running without disk persistence:', e);
  }
  return persister;
}
