import React, { useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { Radius, Typography } from '../../theme/typography';
import { EmptyState } from '../../ui';
import { DiscoverCandidate } from '../../api/types';
import { distanceLabel, nameAge, useDeck } from './DeckContext';
import { DiscoverHeader } from './DiscoverHeader';
import { ProfileSheet } from './ProfileSheet';

const { width: W } = Dimensions.get('window');
const GAP = 12;
const TILE_W = (W - 32 - GAP) / 2;

/** S10 — "Love in Your Area" grid of the same discover deck. */
export const NearbyScreen: React.FC = () => {
  const deck = useDeck();
  const [open, setOpen] = useState<DiscoverCandidate | null>(null);

  return (
    <View style={styles.flex}>
      <FlatList
        data={deck.queue}
        keyExtractor={c => c.user_id}
        numColumns={2}
        columnWrapperStyle={styles.col}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={deck.refresh} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <DiscoverHeader title="Love in Your Area" subtitle="Find love near you" />
          </View>
        }
        ListEmptyComponent={
          deck.loading ? (
            <EmptyState loading title="Looking around…" />
          ) : deck.error ? (
            <EmptyState emoji="📡" title="Couldn’t load people" message={deck.error} actionLabel="Try again" onAction={deck.refresh} />
          ) : (
            <EmptyState emoji="🗺️" title="No one nearby yet" message="Try a larger distance in filters, or pull to refresh." />
          )
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => setOpen(item)}
            accessibilityRole="button"
            accessibilityLabel={`${nameAge(item)}, ${distanceLabel(item.distance_km)}`}
            style={({ pressed }) => [styles.tile, index % 4 === 1 && styles.tileTall, pressed && styles.pressed]}
          >
            {item.photos[0]?.photo_url ? (
              <Image source={{ uri: item.photos[0].photo_url }} style={StyleSheet.absoluteFill} />
            ) : null}
            <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
              <Defs>
                <LinearGradient id={`g${index}`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0.5" stopColor="#000" stopOpacity={0} />
                  <Stop offset="1" stopColor="#000" stopOpacity={0.65} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill={`url(#g${index})`} />
            </Svg>
            <View style={styles.tileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {nameAge(item)}
                </Text>
                    </View>
              <Text style={styles.dist}>{distanceLabel(item.distance_km)}</Text>
            </View>
          </Pressable>
        )}
      />

      <ProfileSheet
        visible={!!open}
        candidate={open}
        onClose={() => setOpen(null)}
        onLike={() => {
          if (open) deck.swipe(open, 'like');
          setOpen(null);
        }}
        onPass={() => {
          if (open) deck.swipe(open, 'dislike');
          setOpen(null);
        }}
        onSafetyAction={kind => kind === 'blocked' && deck.reset()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { marginHorizontal: -16 },
  list: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
  col: { gap: GAP, marginBottom: GAP },
  tile: { width: TILE_W, height: TILE_W * 1.25, borderRadius: Radius.card, overflow: 'hidden', backgroundColor: Colors.primarySoft },
  tileTall: { height: TILE_W * 1.45 },
  pressed: { transform: [{ scale: 0.98 }] },
  tileInfo: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { ...Typography.bodyStrong, color: Colors.white, fontWeight: '700', flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.online },
  dist: { ...Typography.caption, color: 'rgba(255,255,255,0.85)' },
});
