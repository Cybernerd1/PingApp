import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Avatar, EmptyState, GlassCard, ListRow, PillButton, Sheet } from '../../../ui';
import { privacyApi } from '../../../api/privacy';
import { safetyApi } from '../../../api/safety';
import { unwrap } from '../../../api/client';
import { PrivacySettings } from '../../../api/types';
import { PhotoManager } from '../../../ui/PhotoManager';

const PRIVACY_KEY = ['privacy'];
const DEFAULT_PRIVACY: PrivacySettings = {
  show_distance: true,
  show_age: true,
  show_online_status: false,
  profile_visible_in_discover: true,
};

/** GET/PUT /users/privacy/settings — each toggle saves immediately. */
export const PrivacySheet: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: PRIVACY_KEY,
    queryFn: async () => {
      const res = await privacyApi.getPrivacySettings();
      if (res.status === 'error' && res.code === 'NOT_FOUND') return DEFAULT_PRIVACY;
      return unwrap(res);
    },
    staleTime: 30 * 60_000,
    meta: { persist: true },
    enabled: visible,
  });
  const m = useMutation({
    mutationFn: async (patch: Partial<PrivacySettings>) => unwrap(await privacyApi.updatePrivacySettings(patch)),
    onMutate: patch => {
      const prev = qc.getQueryData<PrivacySettings>(PRIVACY_KEY);
      if (prev) qc.setQueryData(PRIVACY_KEY, { ...prev, ...patch });
      return { prev };
    },
    onError: (_e, _p, ctx) => ctx?.prev && qc.setQueryData(PRIVACY_KEY, ctx.prev),
    onSuccess: data => {
      qc.setQueryData(PRIVACY_KEY, data);
      qc.invalidateQueries({ queryKey: ['discover'] });
    },
  });
  const s = q.data;
  const row = (key: keyof PrivacySettings, title: string, subtitle: string, last?: boolean) => (
    <ListRow
      title={title}
      subtitle={subtitle}
      last={last}
      toggle={{ value: !!s?.[key], onChange: v => m.mutate({ [key]: v }), disabled: !s }}
    />
  );
  return (
    <Sheet visible={visible} onClose={onClose} title="Privacy">
      {!s ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : (
        <GlassCard strong padded={false} style={styles.card}>
          <View style={styles.inner}>
            {row('profile_visible_in_discover', 'Show me in Discover', 'Turn off to pause — matches and chats keep working.')}
            {row('show_age', 'Show my age', 'Others see your age on your card.')}
            {row('show_distance', 'Show my distance', 'Others see roughly how far away you are.')}
            {row('show_online_status', 'Show when I’m online', 'Matches can see when you’re active.', true)}
          </View>
        </GlassCard>
      )}
      {m.error ? <Text style={styles.err}>{(m.error as Error).message}</Text> : null}
    </Sheet>
  );
};

/** GET /users/blocked + DELETE /users/{id}/block. */
export const BlockedSheet: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['blockedUsers'],
    queryFn: async () => unwrap(await safetyApi.getBlockedUsers()).users,
    staleTime: 30 * 60_000,
    meta: { persist: true },
    enabled: visible,
  });
  const unblock = useMutation({
    mutationFn: async (id: string) => unwrap(await safetyApi.unblockUser(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blockedUsers'] }),
  });
  return (
    <Sheet visible={visible} onClose={onClose} title="Blocked people">
      {q.isLoading ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : !q.data?.length ? (
        <EmptyState emoji="🕊️" title="No one blocked" />
      ) : (
        q.data.map((u, i) => (
          <ListRow
            key={u.user_id}
            title={u.full_name}
            subtitle={`Blocked ${new Date(u.blocked_at).toLocaleDateString()}`}
            last={i === q.data!.length - 1}
            right={
              <View style={styles.rowRight}>
                <Avatar uri={u.profile_picture} name={u.full_name} size={36} />
                <PillButton
                  title="Unblock"
                  variant="glass"
                  onPress={() => unblock.mutate(u.user_id)}
                  loading={unblock.isPending && unblock.variables === u.user_id}
                  style={styles.unblock}
                  textStyle={styles.unblockText}
                />
              </View>
            }
          />
        ))
      )}
      {unblock.error ? <Text style={styles.err}>{(unblock.error as Error).message}</Text> : null}
    </Sheet>
  );
};

/** Profile photos editor in a sheet. */
export const PhotosSheet: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => (
  <Sheet visible={visible} onClose={onClose} title="Your photos" tall>
    <Text style={styles.hint}>Tap a photo to make it your main picture. Up to 6.</Text>
    <PhotoManager gutter={20} />
  </Sheet>
);

const styles = StyleSheet.create({
  loader: { marginVertical: 40 },
  card: { marginBottom: 12 },
  inner: { paddingHorizontal: 16 },
  err: { ...Typography.label, color: Colors.danger, marginTop: 10 },
  hint: { ...Typography.caption, color: Colors.mute, marginBottom: 12 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unblock: { height: 36, paddingHorizontal: 14 },
  unblockText: { fontSize: 13 },
});
