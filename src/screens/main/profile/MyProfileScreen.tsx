import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import { Colors, Palette } from '../../../theme/colors';
import { Radius, Typography } from '../../../theme/typography';
import { Avatar, Chip, ChevronRight, Edit, GlassCard, ListRow, PillButton, useConfirmDialog } from '../../../ui';
import { mainPhoto, useSession } from '../../../session/SessionContext';
import { useDeck } from '../DeckContext';
import { FiltersSheet } from '../FiltersSheet';
import { EditProfileSheet } from './EditProfileSheet';
import { InterestsSheet } from './InterestsSheet';
import { BlockedSheet, PhotosSheet, PrivacySheet } from './SettingsSheets';
import { LegalKind, LegalSheet } from './LegalSheet';
import { matchesApi } from '../../../api/matches';
import { unwrap } from '../../../api/client';
import { MatchItem } from '../../../api/types';
import { ProfileSheet } from '../ProfileSheet';
import { MATCHES_KEY } from '../ChatsScreen';
import { MatchesScreen } from './MatchesScreen';

type SheetName = 'edit' | 'interests' | 'photos' | 'prefs' | 'privacy' | 'blocked' | null;

interface Props {
  /** Called when user taps Chat on a match — parent navigates to chat thread. */
  onOpenChat?: (match: MatchItem) => void;
}

/** S15 — own profile + settings (reference "Profile" screen). */
export const MyProfileScreen: React.FC<Props> = ({ onOpenChat }) => {
  const { me, identity, refreshMe, signOut } = useSession();
  const deck = useDeck();
  const [sheet, setSheet] = useState<SheetName>(null);
  const [legal, setLegal] = useState<LegalKind | null>(null);
  const [viewedMatch, setViewedMatch] = useState<MatchItem | null>(null);
  const [matchesOpen, setMatchesOpen] = useState(false);
  const { dialog, showDialog } = useConfirmDialog();
  const close = () => setSheet(null);
  const photos = me.photos ?? [];

  const matchesQuery = useQuery({
    queryKey: MATCHES_KEY,
    queryFn: async () => unwrap(await matchesApi.getMatches()).matches,
  });
  const allMatches = matchesQuery.data ?? [];

  const confirmLogout = () =>
    showDialog({
      title: 'Log out?',
      message: "You'll need to sign in again to see your matches and chats.",
      buttons: [
        { label: 'Cancel', variant: 'cancel', onPress: () => {} },
        { label: 'Log out', variant: 'destructive', onPress: () => signOut() },
      ],
    });

  // NOTE: "Download my data", "Hide my profile" and "Delete account" are hidden for now.
  // accountApi (exportUserData / deleteProfile / deleteAccount) is still available to re-enable.

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle} accessibilityRole="header">
        Profile
      </Text>

      <View style={styles.hero}>
        <View style={styles.banner}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="banner" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={Palette.mint} />
                <Stop offset="0.5" stopColor={Palette.lilac} />
                <Stop offset="1" stopColor={Palette.peach} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" rx={24} fill="url(#banner)" />
          </Svg>
        </View>
        <Pressable onPress={() => setSheet('photos')} accessibilityLabel="Edit photos" style={styles.avatarWrap}>
          <Avatar uri={mainPhoto(me) ?? identity?.photo} name={me.full_name} size={116} ring />
        </Pressable>
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {me.full_name}
            {me.age ? ` ${me.age}` : ''}
          </Text>
        </View>
        {me.bio ? <Text style={styles.bio}>{me.bio}</Text> : <Text style={styles.bioEmpty}>Add a bio so people know what you're about.</Text>}
        {identity?.email ? <Text style={styles.email}>{identity.email}</Text> : null}

        <PillButton title="Set Up Preferences" onPress={() => setSheet('prefs')} style={styles.prefsBtn} />
      </View>

      {/* ─── Matches section ─────────────────────────────────────── */}
      <GlassCard strong style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>
            Matches{allMatches.length ? ` · ${allMatches.length}` : ''}
          </Text>
          {/* Arrow button — opens full matches screen */}
          <Pressable
            onPress={() => setMatchesOpen(true)}
            style={({ pressed }) => [styles.seeAllBtn, pressed && styles.seeAllBtnPressed]}
            accessibilityLabel="See all matches"
            hitSlop={8}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight size={14} color={Colors.primary} />
          </Pressable>
        </View>
        {matchesQuery.isLoading ? (
          <ActivityIndicator color={Colors.primary} style={styles.matchLoader} />
        ) : allMatches.length === 0 ? (
          <Text style={styles.emptyMatches}>
            No matches yet — keep swiping! 💜
          </Text>
        ) : (
          <FlatList
            data={allMatches}
            keyExtractor={m => m.match_id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.matchRow}
            renderItem={({ item }) => {
              const photo = item.matched_user.profile_picture?.photo_url;
              const name = item.matched_user.full_name;
              const firstName = name.split(' ')[0];
              return (
                <Pressable
                  style={styles.matchItem}
                  onPress={() => setViewedMatch(item)}
                  accessibilityLabel={`View ${name}'s profile`}
                >
                  <View style={styles.matchAvatarWrap}>
                    <Avatar uri={photo} name={name} size={64} ring />
                  </View>
                  <Text style={styles.matchName} numberOfLines={1}>
                    {firstName}
                  </Text>
                  {item.matched_user.age ? (
                    <Text style={styles.matchAge}>{item.matched_user.age}</Text>
                  ) : null}
                </Pressable>
              );
            }}
          />
        )}
      </GlassCard>

      <GlassCard strong style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>Interests</Text>
          <Pressable onPress={() => setSheet('interests')} style={styles.editBtn} accessibilityLabel="Edit interests" hitSlop={8}>
            <Text style={styles.editText}>Edit</Text>
            <Edit />
          </Pressable>
        </View>
        <View style={styles.chips}>
          {(me.interests ?? []).map((t, i) => (
            <Chip key={t} label={t} tintIndex={i} />
          ))}
        </View>
      </GlassCard>

      <GlassCard strong style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>Photos</Text>
          <Pressable onPress={() => setSheet('photos')} style={styles.editBtn} accessibilityLabel="Edit photos" hitSlop={8}>
            <Text style={styles.editText}>Edit</Text>
            <Edit />
          </Pressable>
        </View>
        <View style={styles.thumbs}>
          {photos.slice(0, 6).map(p => (
            <Image key={p.photo_id} source={{ uri: p.photo_url }} style={styles.thumb} />
          ))}
        </View>
      </GlassCard>

      <GlassCard strong padded={false} style={styles.card}>
        <View style={styles.list}>
          <ListRow title="Edit profile" subtitle="Name, bio, gender, birthday" onPress={() => setSheet('edit')} />
          <ListRow title="Privacy" subtitle="Visibility, age, distance" onPress={() => setSheet('privacy')} />
          <ListRow title="Blocked people" onPress={() => setSheet('blocked')} />
          <ListRow title="Terms & Conditions" onPress={() => setLegal('terms')} />
          <ListRow title="Privacy Policy" onPress={() => setLegal('privacy')} last />
        </View>
      </GlassCard>

      <GlassCard strong padded={false} style={styles.card}>
        <View style={styles.list}>
          <ListRow title="Log out" onPress={confirmLogout} last />
        </View>
      </GlassCard>

      {dialog}

      <EditProfileSheet visible={sheet === 'edit'} me={me} onClose={close} onSaved={() => { refreshMe(); deck.reset(); }} />
      <InterestsSheet visible={sheet === 'interests'} current={me.interests ?? []} onClose={close} onSaved={refreshMe} />
      <PhotosSheet visible={sheet === 'photos'} onClose={() => { close(); refreshMe(); }} />
      <FiltersSheet visible={sheet === 'prefs'} onClose={close} onSaved={deck.reset} />
      <PrivacySheet visible={sheet === 'privacy'} onClose={close} />
      <BlockedSheet visible={sheet === 'blocked'} onClose={close} />
      <LegalSheet kind={legal} onClose={() => setLegal(null)} />

      {/* Match profile viewer */}
      {viewedMatch ? (
        <ProfileSheet
          visible={!!viewedMatch}
          userId={viewedMatch.matched_user.user_id}
          matchId={viewedMatch.match_id}
          onClose={() => setViewedMatch(null)}
          onOpenChat={match => {
            setViewedMatch(null);
            onOpenChat?.(match);
          }}
        />
      ) : null}

      {/* Full matches list */}
      <MatchesScreen
        visible={matchesOpen}
        onClose={() => setMatchesOpen(false)}
        onOpenChat={match => {
          setMatchesOpen(false);
          onOpenChat?.(match);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  screenTitle: { ...Typography.heading, color: Colors.ink, textAlign: 'center', marginTop: 12 },
  hero: { alignItems: 'center', marginTop: 12, marginBottom: 16 },
  banner: { position: 'absolute', top: 30, left: 0, right: 0, height: 90, borderRadius: Radius.card, overflow: 'hidden' },
  avatarWrap: { marginTop: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  name: { ...Typography.title, color: Colors.ink },
  bio: { ...Typography.body, color: Colors.mute, textAlign: 'center', marginTop: 6, paddingHorizontal: 12 },
  bioEmpty: { ...Typography.body, color: Colors.faint, textAlign: 'center', marginTop: 6 },
  email: { ...Typography.caption, color: Colors.faint, marginTop: 6 },
  prefsBtn: { marginTop: 18, alignSelf: 'stretch' },
  card: { marginBottom: 14 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { ...Typography.bodyStrong, color: Colors.ink },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { ...Typography.label, color: Colors.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumb: { width: 64, height: 80, borderRadius: 14, backgroundColor: Colors.primarySoft },
  list: { paddingHorizontal: 16 },
  // Matches
  matchLoader: { marginVertical: 24 },
  emptyMatches: { ...Typography.body, color: Colors.faint, textAlign: 'center', paddingVertical: 16 },
  matchRow: { gap: 14, paddingBottom: 4 },
  matchItem: { alignItems: 'center', width: 78 },
  matchAvatarWrap: { marginBottom: 6 },
  matchName: { ...Typography.caption, color: Colors.ink, fontWeight: '600', textAlign: 'center' },
  matchAge: { ...Typography.caption, color: Colors.mute, textAlign: 'center' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4, paddingHorizontal: 8, borderRadius: Radius.pill, backgroundColor: Colors.primarySoft },
  seeAllBtnPressed: { opacity: 0.7 },
  seeAllText: { ...Typography.label, color: Colors.primary, fontSize: 13 },
});
