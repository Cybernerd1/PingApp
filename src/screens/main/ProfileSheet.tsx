import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../theme/colors';
import { Radius, Typography } from '../../theme/typography';
import { ArrowLeft, Chip, Close, Heart, IconButton, More } from '../../ui';
import { profileApi } from '../../api/profile';
import { unwrap } from '../../api/client';
import { DiscoverCandidate } from '../../api/types';
import { distanceLabel } from './DeckContext';
import { SafetySheet } from './SafetySheet';

const { width: W } = Dimensions.get('window');

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
}

/** S16 — full profile of another user. */
export const ProfileSheet: React.FC<Props> = ({ candidate, userId, visible, onClose, onLike, onPass, onSafetyAction, matchId }) => {
  const insets = useSafeAreaInsets();
  const id = candidate?.user_id ?? userId ?? null;
  const [menu, setMenu] = useState(false);
  const [page, setPage] = useState(0);

  const remote = useQuery({
    queryKey: ['publicProfile', id],
    queryFn: async () => unwrap(await profileApi.getUserProfileById(id!)),
    enabled: visible && !!id && !candidate,
  });

  const name = candidate?.full_name ?? remote.data?.full_name ?? '';
  const age = candidate?.age ?? remote.data?.age ?? null;
  const bio = candidate?.bio ?? remote.data?.bio ?? null;
  const interests = candidate?.interests ?? remote.data?.interests ?? [];
  const photos = (candidate?.photos ?? remote.data?.photos ?? []).map(p => p.photo_url);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
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

        {onLike || onPass ? (
          <View style={[styles.actions, { bottom: insets.bottom + 24 }]}>
            {onPass ? (
              <IconButton accessibilityLabel="Pass" onPress={onPass} size={64} variant="white">
                <Close size={26} color={Colors.danger} />
              </IconButton>
            ) : null}
            {onLike ? (
              <IconButton accessibilityLabel="Like" onPress={onLike} size={72} variant="primary">
                <Heart size={30} />
              </IconButton>
            ) : null}
          </View>
        ) : null}

        {id ? (
          <SafetySheet
            visible={menu}
            onClose={() => setMenu(false)}
            userId={id}
            name={name}
            matchId={matchId}
            onDone={kind => {
              setMenu(false);
              onSafetyAction?.(kind);
              if (kind !== 'reported') onClose();
            }}
          />
        ) : null}
      </View>
    </Modal>
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
});
