import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../theme/colors';
import { Radius, Typography } from '../../theme/typography';
import { ArrowLeft, ChatIcon, Chip, Close, Heart, IconButton, More } from '../../ui';
import { profileApi } from '../../api/profile';
import { unwrap } from '../../api/client';
import { DiscoverCandidate, MatchItem, SwipeAction, UserProfile } from '../../api/types';
import { interactionsApi } from '../../api/interactions';
import { matchesApi } from '../../api/matches';
import { distanceLabel } from './DeckContext';
import { SafetySheet } from './SafetySheet';

const { width: W } = Dimensions.get('window');

const toCandidate = (p: UserProfile): DiscoverCandidate => ({
  user_id: p.user_id,
  full_name: p.full_name,
  age: p.age ?? null,
  gender: p.gender ?? null,
  bio: p.bio ?? null,
  distance_km: null,
  interests: p.interests ?? [],
  photos: (p.photos ?? []).map(photo => ({ photo_id: photo.photo_id, photo_url: photo.photo_url })),
});

interface Props {
  /** A discover card (already has everything) … */
  candidate?: DiscoverCandidate | null;
  /** … or just an id (from chat) → GET /users/profile/{id}. */
  userId?: string | null;
  visible: boolean;
  onClose: () => void;
  onLike?: () => void;
  onPass?: () => void;
  /** Called after block / unmatch so the parent can leave the chat etc. */
  onSafetyAction?: (kind: 'blocked' | 'reported' | 'unmatched') => void;
  matchId?: string | null;
  /** Called when user taps the chat button (only shown when already matched). */
  onOpenChat?: (match: MatchItem) => void;
}

/** S16 — full profile of another user. */
export const ProfileSheet: React.FC<Props> = props => (
  <Modal visible={props.visible} animationType="slide" onRequestClose={props.onClose} statusBarTranslucent navigationBarTranslucent>
    {/* Modals are separate Android windows → give them their own safe-area provider. */}
    <SafeAreaProvider>
      <ProfileContent {...props} />
    </SafeAreaProvider>
  </Modal>
);

const ProfileContent: React.FC<Props> = ({ candidate, userId, visible, onClose, onLike, onPass, onSafetyAction, matchId, onOpenChat }) => {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const id = candidate?.user_id ?? userId ?? null;
  const [menu, setMenu] = useState(false);
  const [page, setPage] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  const remote = useQuery({
    queryKey: ['publicProfile', id],
    queryFn: async () => unwrap(await profileApi.getUserProfileById(id!)),
    enabled: visible && !!id && !candidate,
  });

  const matches = useQuery({
    queryKey: ['matches'],
    queryFn: async () => unwrap(await matchesApi.getMatches()).matches,
    enabled: visible && !!id && !candidate,
    staleTime: 30_000,
  });

  const existingMatch = matches.data?.find(item => item.matched_user.user_id === id);
  const activeMatchId = matchId ?? existingMatch?.match_id ?? null;
  const actionCandidate = candidate ?? (remote.data ? toCandidate(remote.data) : null);
  const notificationAction = useMutation({
    mutationFn: async (action: SwipeAction) => interactionsApi.swipe({ user_id: actionCandidate!.user_id, action }),
    onMutate: () => setActionError(null),
    onSuccess: result => {
      if (result.status === 'error') {
        // A like notification can outlive the profile. Treat definitive server
        // rejections as a silent no-op rather than crashing or restoring a card.
        if ([403, 404, 409, 410].includes(result.httpStatus ?? 0)) {
          onClose();
        } else {
          setActionError(result.message);
        }
        return;
      }
      qc.invalidateQueries({ queryKey: ['matches'] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
      qc.invalidateQueries({ queryKey: ['feed'] });
      onClose();
    },
  });

  const name = candidate?.full_name ?? remote.data?.full_name ?? '';
  const age = candidate?.age ?? remote.data?.age ?? null;
  const bio = candidate?.bio ?? remote.data?.bio ?? null;
  const interests = candidate?.interests ?? remote.data?.interests ?? [];
  const photos = (candidate?.photos ?? remote.data?.photos ?? []).map(p => p.photo_url);
  const showActions = !activeMatchId && (!!onLike || !!onPass || (!candidate && !!actionCandidate && !matches.isLoading));

  return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {remote.isLoading && !candidate ? (
          <ActivityIndicator style={styles.loader} color={Colors.primary} size="large" />
        ) : remote.isError && !candidate ? (
          <View style={styles.loader}>
            <Text style={styles.err}>{(remote.error as Error).message}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}>
            <View>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={e => setPage(Math.round(e.nativeEvent.contentOffset.x / W))}
              >
                {(photos.length ? photos : [null]).map((uri, i) =>
                  uri ? (
                    <Image key={i} source={{ uri }} style={styles.photo} />
                  ) : (
                    <View key={i} style={[styles.photo, styles.noPhoto]} />
                  ),
                )}
              </ScrollView>
              {photos.length > 1 ? (
                <View style={styles.bars}>
                  {photos.map((_, i) => (
                    <View key={i} style={[styles.bar, i === page && styles.barOn]} />
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.body}>
              <Text style={styles.name}>
                {name}
                {age ? <Text style={styles.age}>{`  ${age}`}</Text> : null}
              </Text>
              {candidate ? <Text style={styles.meta}>{distanceLabel(candidate.distance_km)}</Text> : null}

              {bio ? (
                <>
                  <Text style={styles.section}>About</Text>
                  <Text style={styles.bio}>{bio}</Text>
                </>
              ) : null}

              {interests.length ? (
                <>
                  <Text style={styles.section}>Interests</Text>
                  <View style={styles.chips}>
                    {interests.map((t, i) => (
                      <Chip key={t} label={t} tintIndex={i} />
                    ))}
                  </View>
                </>
              ) : null}
            </View>
          </ScrollView>
        )}

        <View style={[styles.topBar, { top: insets.top + 8 }]}>
          <IconButton accessibilityLabel="Close profile" onPress={onClose} variant="white">
            <ArrowLeft />
          </IconButton>
          {id ? (
            <IconButton accessibilityLabel="Report or block" onPress={() => setMenu(true)} variant="white">
              <More />
            </IconButton>
          ) : null}
        </View>

        {/* Like/Pass action buttons (from Discover or a like notification). */}
        {showActions ? (
          <View style={[styles.actions, { bottom: insets.bottom + 24 }]}> 
            {onPass ? (
              <IconButton accessibilityLabel="Pass" onPress={onPass} disabled={notificationAction.isPending} size={64} variant="white">
                <Close size={26} color={Colors.danger} />
              </IconButton>
            ) : !candidate ? (
              <IconButton accessibilityLabel="Pass" onPress={() => notificationAction.mutate('dislike')} disabled={notificationAction.isPending} size={64} variant="white">
                <Close size={26} color={Colors.danger} />
              </IconButton>
            ) : null}
            {onLike ? (
              <IconButton accessibilityLabel="Like" onPress={onLike} disabled={notificationAction.isPending} size={72} variant="primary">
                <Heart size={30} />
              </IconButton>
            ) : !candidate ? (
              <IconButton accessibilityLabel="Like" onPress={() => notificationAction.mutate('like')} disabled={notificationAction.isPending} size={72} variant="primary">
                <Heart size={30} />
              </IconButton>
            ) : null}
          </View>
        ) : null}
        {actionError ? <Text style={[styles.actionError, { bottom: insets.bottom + 104 }]}>{actionError}</Text> : null}

        {/* Chat button — only visible when already matched */}
        {activeMatchId && onOpenChat && !showActions ? (
          <View style={[styles.chatBar, { paddingBottom: insets.bottom + 16 }]}>
            <Pressable
              style={({ pressed }) => [styles.chatBtn, pressed && styles.chatBtnPressed]}
              onPress={() => {
                onClose();
                onOpenChat({
                   match_id: activeMatchId,
                  chat_id: null,
                  matched_at: '',
                  has_conversation: true,
                  last_message: null,
                  matched_user: {
                    user_id: id ?? '',
                    full_name: name,
                    age: age ?? null,
                    profile_picture: photos[0] ? { photo_id: null, photo_url: photos[0] } : null,
                  },
                });
              }}
              accessibilityLabel={`Message ${name.split(' ')[0]}`}
            >
              <ChatIcon size={18} color={Colors.white} />
              <Text style={styles.chatBtnText}>Message {name.split(' ')[0]}</Text>
            </Pressable>
          </View>
        ) : null}

        {id ? (
          <SafetySheet
            visible={menu}
            onClose={() => setMenu(false)}
            userId={id}
            name={name}
             matchId={activeMatchId}
            onDone={kind => {
              setMenu(false);
              onSafetyAction?.(kind);
              if (kind !== 'reported') onClose();
            }}
          />
        ) : null}
      </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F3FB' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  err: { ...Typography.body, color: Colors.danger, textAlign: 'center' },
  photo: { width: W, height: W * 1.25, backgroundColor: Colors.primarySoft },
  noPhoto: { backgroundColor: Colors.primarySoft },
  bars: { position: 'absolute', top: 54, left: 16, right: 16, flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.45)' },
  barOn: { backgroundColor: Colors.white },
  body: {
    marginTop: -28,
    borderTopLeftRadius: Radius.largeCard,
    borderTopRightRadius: Radius.largeCard,
    backgroundColor: '#F6F3FB',
    padding: 24,
  },
  name: { ...Typography.title, color: Colors.ink },
  age: { fontWeight: '500', color: Colors.mute },
  meta: { ...Typography.label, color: Colors.mute, marginTop: 4 },
  section: { ...Typography.label, color: Colors.mute, marginTop: 22, marginBottom: 8 },
  bio: { ...Typography.body, color: Colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  actions: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 28 },
  actionError: { position: 'absolute', left: 24, right: 24, ...Typography.caption, color: Colors.danger, textAlign: 'center' },
  // Chat CTA
  chatBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: 'rgba(246,243,251,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(18,16,22,0.06)',
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: 14,
  },
  chatBtnPressed: { opacity: 0.8 },
  chatBtnText: { ...Typography.bodyStrong, color: Colors.white, fontSize: 16 },
});
