/**
 * Wipe the query cache in memory AND on disk. Called on:
 * - logout (App.tsx handleLogout)
 * - silent 401 / unrecoverable refresh failure (App.tsx expired listener)
 * - and as the hook for account deletion / account switch when those are
 *   (re-)enabled — see the note in App.tsx.
 */
import { queryClient } from './queryClient';
import { getStorage } from './storage';

export async function purgeCache(): Promise<void> {
  queryClient.clear();
  try {
    getStorage().clearAll();
  } catch {
    // Storage not initialized (e.g. purge fired during boot) or MMKV failed to
    // open — nothing could have been persisted, so there's nothing to wipe.
  }
}
