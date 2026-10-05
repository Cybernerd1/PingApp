import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { Radius, Typography } from '../../theme/typography';
import { DiscoverCandidate, SwipeAction } from '../../api/types';
import { distanceLabel, nameAge } from './DeckContext';

const { width: W } = Dimensions.get('window');
const THRESHOLD = W * 0.28;

export interface SwipeCardHandle {
  fling: (action: SwipeAction) => void;
}

interface CardProps {
  candidate: DiscoverCandidate;
  onSwiped: (action: SwipeAction) => void;
  onOpen: () => void;
}

/** Top card: draggable, photo-tappable. */
export const SwipeCard = forwardRef<SwipeCardHandle, CardProps>(({ candidate, onSwiped, onOpen }, ref) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = candidate.photos.length ? candidate.photos : [];

  const finish = (action: SwipeAction) => onSwiped(action);

  const flingTo = (action: SwipeAction) => {
    'worklet';
    const dir = action === 'like' ? 1 : -1;
    x.value = withTiming(dir * W * 1.5, { duration: 260 }, done => {
      if (done) runOnJS(finish)(action);
    });
  };

  useImperativeHandle(ref, () => ({ fling: (a: SwipeAction) => flingTo(a) }));

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate(e => {
      x.value = e.translationX;
      y.value = e.translationY * 0.3;
    })
    .onEnd(e => {
      if (x.value > THRESHOLD || e.velocityX > 900) flingTo('like');
      else if (x.value < -THRESHOLD || e.velocityX < -900) flingTo('dislike');
      else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${interpolate(x.value, [-W, W], [-12, 12], Extrapolation.CLAMP)}deg` },
    ],
  }));
  const likeStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, THRESHOLD], [0, 1], Extrapolation.CLAMP) }));
  const nopeStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-THRESHOLD, 0], [1, 0], Extrapolation.CLAMP) }));

  const tapPhoto = (side: 'left' | 'right') => {
    if (photos.length < 2) return onOpen();
    setPhotoIdx(i => (side === 'right' ? Math.min(i + 1, photos.length - 1) : Math.max(i - 1, 0)));
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        <CardFace candidate={candidate} photoIdx={photoIdx} onTap={tapPhoto} onOpen={onOpen} />
        <Animated.View style={[styles.stamp, styles.stampLike, likeStyle]} pointerEvents="none">
          <Text style={[styles.stampText, { color: Colors.primary }]}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampNope, nopeStyle]} pointerEvents="none">
          <Text style={[styles.stampText, { color: Colors.danger }]}>NOPE</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});

/** Static visual of a card (also used for the card behind the top one). */
export const CardFace: React.FC<{
  candidate: DiscoverCandidate;
  photoIdx?: number;
  onTap?: (side: 'left' | 'right') => void;
  onOpen?: () => void;
}> = ({ candidate, photoIdx = 0, onTap, onOpen }) => {
  const photos = candidate.photos;
  const uri = photos[photoIdx]?.photo_url ?? photos[0]?.photo_url;
  return (
    <View style={styles.face}>
      {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <View style={[StyleSheet.absoluteFill, styles.noPhoto]} />}

      {photos.length > 1 ? (
        <View style={styles.bars} pointerEvents="none">
          {photos.map((p, i) => (
            <View key={p.photo_id ?? i} style={[styles.bar, i === photoIdx && styles.barOn]} />
          ))}
        </View>
      ) : null}

      {onTap ? (
        <View style={styles.tapZones}>
          <Pressable style={styles.flex} onPress={() => onTap('left')} accessibilityLabel="Previous photo" />
          <Pressable style={styles.flex} onPress={() => onTap('right')} accessibilityLabel="Next photo" />
        </View>
      ) : null}

      <Svg style={styles.shade} width="100%" height="100%" pointerEvents="none">
        <Defs>
          <LinearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0.45" stopColor="#000" stopOpacity={0} />
            <Stop offset="1" stopColor="#000" stopOpacity={0.72} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#shade)" />
      </Svg>

      <Pressable style={styles.info} onPress={onOpen} accessibilityRole="button" accessibilityLabel={`Open ${candidate.full_name}'s profile`}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {nameAge(candidate)}
          </Text>
        </View>
        <Text style={styles.meta}>{distanceLabel(candidate.distance_km)}</Text>
        {candidate.interests.length ? (
          <View style={styles.tags}>
            {candidate.interests.slice(0, 3).map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { ...StyleSheet.absoluteFill },
  face: { flex: 1, borderRadius: Radius.largeCard, overflow: 'hidden', backgroundColor: Colors.primarySoft },
  noPhoto: { backgroundColor: Colors.primarySoft },
  bars: { position: 'absolute', top: 12, left: 16, right: 16, flexDirection: 'row', gap: 4, zIndex: 3 },
  bar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  barOn: { backgroundColor: Colors.white },
  tapZones: { ...StyleSheet.absoluteFill, flexDirection: 'row', bottom: '35%', zIndex: 2 },
  shade: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  info: { position: 'absolute', left: 20, right: 76, bottom: 22, zIndex: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { ...Typography.title, color: Colors.white, flexShrink: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.online },
  meta: { ...Typography.label, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.22)' },
  tagText: { ...Typography.caption, color: Colors.white, fontWeight: '600' },
  stamp: { position: 'absolute', top: 40, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, borderWidth: 3, backgroundColor: 'rgba(255,255,255,0.85)' },
  stampLike: { left: 24, borderColor: Colors.primary, transform: [{ rotate: '-14deg' }] },
  stampNope: { right: 24, borderColor: Colors.danger, transform: [{ rotate: '14deg' }] },
  stampText: { fontSize: 26, fontWeight: '900', letterSpacing: 2 },
});
