import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../../theme/colors';
import { Radius, Typography } from '../../../theme/typography';
import { ArrowLeft, Avatar, ChatIcon, IconButton } from '../../../ui';
import { matchesApi } from '../../../api/matches';
import { unwrap } from '../../../api/client';
import { MatchItem } from '../../../api/types';
import { MATCHES_KEY } from '../ChatsScreen';
import { ProfileSheet } from '../ProfileSheet';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Called when user taps "Message" on a match → navigates to the chat. */
  onOpenChat: (match: MatchItem) => void;
}

/** Full-screen modal showing every match with avatar, name, age and a Chat CTA. */
export const MatchesScreen: React.FC<Props> = ({ visible, onClose, onOpenChat }) => (
  <Modal
    visible={visible}
    animationType="slide"
    onRequestClose={onClose}
    statusBarTranslucent
    navigationBarTranslucent
  >
    <SafeAreaProvider>
      <MatchesContent onClose={onClose} onOpenChat={onOpenChat} />
    </SafeAreaProvider>
  </Modal>
);

const MatchesContent: React.FC<Omit<Props, 'visible'>> = ({ onClose, onOpenChat }) => {
  const [viewedMatch, setViewedMatch] = useState<MatchItem | null>(null);

  const query = useQuery({
    queryKey: MATCHES_KEY,
    queryFn: async () => unwrap(await matchesApi.getMatches()).matches,
  });

  const matches = query.data ?? [];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton accessibilityLabel="Back" onPress={onClose} variant="white">
          <ArrowLeft />
        </IconButton>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Your Matches</Text>
          {matches.length > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{matches.length}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.spacer} />
      </View>

      {/* List */}
      {query.isLoading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} size="large" />
      ) : query.isError ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Text style={styles.emptyTitle}>Couldn't load matches</Text>
          <Pressable onPress={() => query.refetch()} hitSlop={8} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💜</Text>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySub}>Keep swiping — someone's waiting!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={m => m.match_id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={() => {
                query.refetch();
              }}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => {
            const photo = item.matched_user.profile_picture?.photo_url;
            const name = item.matched_user.full_name;
            const firstName = name.split(' ')[0];
            const age = item.matched_user.age;
            const matchedDate = new Date(item.matched_at).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
            });
            return (
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => setViewedMatch(item)}
                accessibilityLabel={`View ${name}'s profile`}
              >
                <Avatar uri={photo} name={name} size={60} ring />
                <View style={styles.cardBody}>
                  <Text style={styles.cardName}>
                    {name}
                    {age ? <Text style={styles.cardAge}>  {age}</Text> : null}
                  </Text>
                  <Text style={styles.cardSub}>Matched {matchedDate}</Text>
                </View>
                {/* Chat CTA */}
                <Pressable
                  style={({ pressed }) => [styles.chatBtn, pressed && styles.chatBtnPressed]}
                  onPress={() => {
                    onClose();
                    onOpenChat(item);
                  }}
                  accessibilityLabel={`Message ${firstName}`}
                  hitSlop={4}
                >
                  <ChatIcon size={16} color={Colors.white} />
                  <Text style={styles.chatBtnText}>Chat</Text>
                </Pressable>
              </Pressable>
            );
          }}
        />
      )}

      {/* Profile viewer */}
      {viewedMatch ? (
        <ProfileSheet
          visible={!!viewedMatch}
          userId={viewedMatch.matched_user.user_id}
          matchId={viewedMatch.match_id}
          onClose={() => setViewedMatch(null)}
          onOpenChat={match => {
            setViewedMatch(null);
            onClose();
            onOpenChat(match);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F3FB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18,16,22,0.06)',
    backgroundColor: Colors.white,
  },
  titleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { ...Typography.title, color: Colors.ink, fontSize: 18 },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: '800' },
  spacer: { width: 44 },
  loader: { flex: 1, marginTop: 40 },
  list: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: { opacity: 0.8 },
  cardBody: { flex: 1 },
  cardName: { ...Typography.bodyStrong, color: Colors.ink, fontSize: 15 },
  cardAge: { fontWeight: '400', color: Colors.mute },
  cardSub: { ...Typography.caption, color: Colors.faint, marginTop: 2 },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chatBtnPressed: { opacity: 0.8 },
  chatBtnText: { ...Typography.label, color: Colors.white, fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...Typography.heading, color: Colors.ink, textAlign: 'center' },
  emptySub: { ...Typography.body, color: Colors.mute, textAlign: 'center', marginTop: 6 },
  retryBtn: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { ...Typography.label, color: Colors.primary },
});
