import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Close, EmptyState, Heart, IconButton, Rewind } from '../../ui';
import { DiscoverCandidate, SwipeAction } from '../../api/types';
import { useDeck } from './DeckContext';
import { DiscoverHeader } from './DiscoverHeader';
import { CardFace, SwipeCard, SwipeCardHandle } from './SwipeDeck';
import { ProfileSheet } from './ProfileSheet';

/** S8 — "Love Starts Here" swipe deck. */
export const HomeScreen: React.FC = () => {
  const deck = useDeck();
  const top = deck.queue[0];
  const next = deck.queue[1];
  const cardRef = useRef<SwipeCardHandle>(null);
  const [open, setOpen] = useState<DiscoverCandidate | null>(null);

  useEffect(() => {
    if (!deck.notice) return;
    const t = setTimeout(deck.clearNotice, 3500);
    return () => clearTimeout(t);
  }, [deck.notice, deck.clearNotice]);

  const act = (action: SwipeAction) => {
    if (cardRef.current) cardRef.current.fling(action);
    else if (top) deck.swipe(top, action);
  };

  return (
    <View style={styles.flex}>
      <DiscoverHeader title="Love Starts Here" subtitle="Discover your next match" />

      <View style={styles.deckArea}>
        {deck.loading && !top ? (
          <EmptyState loading title="Finding people near you…" message="The first load can take a few seconds." />
        ) : deck.error && !top ? (
          <EmptyState emoji="📡" title="Couldn’t load people" message={deck.error} actionLabel="Try again" onAction={deck.refresh} />
        ) : !top ? (
          <EmptyState
            emoji="✨"
            title="You’re all caught up"
            message="No one new nearby right now. Widen your distance or age range with the filter button, or check back soon."
            actionLabel="Refresh"
            onAction={deck.refresh}
          />
        ) : (
          <View style={styles.deck}>
            {next ? (
              <View style={[StyleSheet.absoluteFill, styles.behind]} pointerEvents="none">
                <CardFace candidate={next} />
              </View>
            ) : null}
            <SwipeCard
              key={top.user_id}
              ref={cardRef}
              candidate={top}
              onSwiped={action => deck.swipe(top, action)}
              onOpen={() => setOpen(top)}
            />
            <View style={styles.rail} pointerEvents="box-none">
              <IconButton accessibilityLabel="Undo last swipe" onPress={deck.rewind} disabled={!deck.canRewind} variant="white" size={46}>
                <Rewind size={20} color={Colors.primary} />
              </IconButton>
              <IconButton accessibilityLabel="Pass" onPress={() => act('dislike')} variant="white" size={52}>
                <Close size={22} color={Colors.danger} />
              </IconButton>
              <IconButton accessibilityLabel="Like" onPress={() => act('like')} variant="primary" size={58}>
                <Heart size={26} />
              </IconButton>
            </View>
          </View>
        )}
        {deck.notice ? (
          <View style={styles.notice} accessibilityLiveRegion="polite">
            <Text style={styles.noticeText}>{deck.notice}</Text>
          </View>
        ) : null}
      </View>

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
  deckArea: { flex: 1, paddingHorizontal: 16, paddingBottom: 8 },
  deck: { flex: 1 },
  behind: { transform: [{ scale: 0.95 }, { translateY: 14 }], opacity: 0.9 },
  rail: { position: 'absolute', right: 14, bottom: 28, gap: 14, alignItems: 'center' },
  notice: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: Colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  noticeText: { ...Typography.label, color: Colors.white },
});
