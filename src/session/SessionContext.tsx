import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile';
import { unwrap } from '../api/client';
import { UserProfile } from '../api/types';
import { GoogleIdentity } from './session';

interface SessionValue {
  me: UserProfile;
  identity: GoogleIdentity | null;
  /** Re-fetch GET /users/profile (after edits, photo changes…). */
  refreshMe: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<SessionValue | null>(null);

export const ME_KEY = ['me'] as const;

/** Main-app session: the signed-in user's profile, kept fresh via react-query. */
export const SessionProvider: React.FC<{
  initialProfile: UserProfile;
  identity: GoogleIdentity | null;
  onSignOut: () => Promise<void>;
  children: React.ReactNode;
}> = ({ initialProfile, identity, onSignOut, children }) => {
  const qc = useQueryClient();
  const meQuery = useQuery({
    queryKey: ME_KEY,
    queryFn: async () => unwrap(await profileApi.getOwnProfile()),
    initialData: initialProfile,
    staleTime: 60_000,
  });

  const refreshMe = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ME_KEY });
  }, [qc]);

  const value = useMemo<SessionValue>(
    () => ({ me: meQuery.data ?? initialProfile, identity, refreshMe, signOut: onSignOut }),
    [meQuery.data, initialProfile, identity, refreshMe, onSignOut],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useSession(): SessionValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession must be used inside <SessionProvider>');
  return v;
}

/** Main (order 0) photo URL for a profile. */
export function mainPhoto(p?: Pick<UserProfile, 'photos'> | null): string | undefined {
  const photos = [...(p?.photos ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (photos.find(ph => ph.is_profile_picture) ?? photos[0])?.photo_url;
}
