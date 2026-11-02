/**
 * Wipe the query cache in memory AND on disk. Called on:
 * - logout (App.tsx handleLogout)
 * - silent 401 / unrecoverable refresh failure (App.tsx expired listener)
 * - and as the hook for account deletion / account switch when those are
 *   (re-)enabled — see the note in App.tsx.
 */
import { queryClient } from './queryClient';
import { getStorage } from './storage';
import { ChatConversation, DiscoverCandidate, MatchItem, UserProfile } from '../api/types';

export async function purgeCache(): Promise<void> {
  queryClient.clear();
  try {
    getStorage().clearAll();
  } catch {
    // Storage not initialized (e.g. purge fired during boot) or MMKV failed to
    // open — nothing could have been persisted, so there's nothing to wipe.
  }
}

/** Remove cached records that identify a blocked or unmatched person. */
export function purgeUserCache(userId: string): void {
  queryClient.removeQueries({ queryKey: ['publicProfile', userId] });
  queryClient.setQueriesData<DiscoverCandidate[]>({ queryKey: ['feed'] }, old =>
    old?.filter(candidate => candidate.user_id !== userId),
  );
  queryClient.setQueryData<ChatConversation[]>(['conversations'], old =>
    old?.filter(conversation => conversation.matched_user_id !== userId),
  );
  queryClient.setQueryData<MatchItem[]>(['matches'], old =>
    old?.filter(match => match.matched_user.user_id !== userId),
  );
  queryClient.removeQueries({
    predicate: query => {
      const data = query.state.data as UserProfile | undefined;
      return query.queryKey[0] === 'me' && data?.user_id === userId;
    },
  });
}
