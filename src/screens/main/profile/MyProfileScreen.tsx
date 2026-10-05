import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Colors, Palette } from '../../../theme/colors';
import { Radius, Typography } from '../../../theme/typography';
import { Avatar, Chip, Edit, GlassCard, ListRow, PillButton } from '../../../ui';
import { mainPhoto, useSession } from '../../../session/SessionContext';
import { useDeck } from '../DeckContext';
import { FiltersSheet } from '../FiltersSheet';
import { EditProfileSheet } from './EditProfileSheet';
import { InterestsSheet } from './InterestsSheet';
import { BlockedSheet, PhotosSheet, PrivacySheet } from './SettingsSheets';
import { LegalKind, LegalSheet } from './LegalSheet';

type SheetName = 'edit' | 'interests' | 'photos' | 'prefs' | 'privacy' | 'blocked' | null;

/** S15 — own profile + settings (reference "Profile" screen). */
export const MyProfileScreen: React.FC = () => {
  const { me, identity, refreshMe, signOut } = useSession();
  const deck = useDeck();
  const [sheet, setSheet] = useState<SheetName>(null);
  const [legal, setLegal] = useState<LegalKind | null>(null);
  const close = () => setSheet(null);
  const photos = me.photos ?? [];

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
        {me.bio ? <Text style={styles.bio}>{me.bio}</Text> : <Text style={styles.bioEmpty}>Add a bio so people know what you’re about.</Text>}
        {identity?.email ? <Text style={styles.email}>{identity.email}</Text> : null}

        <PillButton title="Set Up Preferences" onPress={() => setSheet('prefs')} style={styles.prefsBtn} />
      </View>

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
          <ListRow title="Log out" onPress={signOut} last />
        </View>
      </GlassCard>

      <EditProfileSheet visible={sheet === 'edit'} me={me} onClose={close} onSaved={() => { refreshMe(); deck.reset(); }} />
      <InterestsSheet visible={sheet === 'interests'} current={me.interests ?? []} onClose={close} onSaved={refreshMe} />
      <PhotosSheet visible={sheet === 'photos'} onClose={() => { close(); refreshMe(); }} />
      <FiltersSheet visible={sheet === 'prefs'} onClose={close} onSaved={deck.reset} />
      <PrivacySheet visible={sheet === 'privacy'} onClose={close} />
      <BlockedSheet visible={sheet === 'blocked'} onClose={close} />
      <LegalSheet kind={legal} onClose={() => setLegal(null)} />
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
});
