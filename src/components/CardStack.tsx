import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Radius } from '../theme/typography';
import { Tag } from './Tag';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Swipe thresholds
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const SWIPE_UP_THRESHOLD = -100;  // must swipe clearly upward
const SWIPE_UP_VELOCITY = -600;   // or fast fling upward

// ─── Card dimensions ─────────────────────────────────────────────────────────
const CARD_WIDTH = SCREEN_WIDTH * 0.92;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.67;

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const VerifiedSVG = () => (
  <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={Colors.white}
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PinSVG = ({ size = 11, color = Colors.white }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={2} />
  </Svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CandidateProfile {
  id: string;
  username: string;
  age: number;
  bio: string;
  interests: string[];
  photos: string[];
  distanceKm: number;
  jobTitle?: string;
  location?: string;
  height?: string;
  education?: string;
  hometown?: string;
  zodiac?: string;
  lookingFor?: string;
  prompts?: { question: string; answer: string }[];
  spotifyTrack?: { name: string; track: string; image: string };
}

interface CardStackProps {
  candidates: CandidateProfile[];
  onSwipe: (action: 'like' | 'pass' | 'superlike', candidate: CandidateProfile) => void;
  onEmpty: () => void;
  onExpandProfile?: (candidate: CandidateProfile) => void;
}

// ─── Single swipeable card ────────────────────────────────────────────────────
interface SwipeCardProps {
  candidate: CandidateProfile;
  photoIndices: Record<string, number>;
  onPhotoTap: (direction: 'left' | 'right', candidateId: string) => void;
  likeOpacity: Animated.SharedValue<number>;
  nopeOpacity: Animated.SharedValue<number>;
  superOpacity: Animated.SharedValue<number>;
  cardStyle: any;
  gesture: any;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  candidate,
  photoIndices,
  onPhotoTap,
  likeOpacity,
  nopeOpacity,
  superOpacity,
  cardStyle,
  gesture,
}) => {
  const currentPhotoIdx = photoIndices[candidate.id] ?? 0;
  const photoUrl =
    candidate.photos?.[currentPhotoIdx] ?? candidate.photos?.[0] ?? '';

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(likeOpacity.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(nopeOpacity.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));
  const superStyle = useAnimatedStyle(() => ({
    opacity: interpolate(superOpacity.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Photo */}
        <Image source={{ uri: photoUrl }} style={styles.cardImage} resizeMode="cover" />

        {/* Photo tap areas */}
        {candidate.photos.length > 1 && (
          <>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.photoTapLeft}
              onPress={() => onPhotoTap('left', candidate.id)}
            />
            <TouchableOpacity
              activeOpacity={1}
              style={styles.photoTapRight}
              onPress={() => onPhotoTap('right', candidate.id)}
            />
          </>
        )}

        {/* Photo segment indicators */}
        {candidate.photos.length > 1 && (
          <View style={styles.photoIndicators} pointerEvents="none">
            {candidate.photos.map((_, i) => (
              <View
                key={i}
                style={[styles.indicatorBar, i === currentPhotoIdx && styles.indicatorActive]}
              />
            ))}
          </View>
        )}

        {/* Stamp overlays */}
        <Animated.View style={[styles.stamp, styles.likeStamp, likeStyle]} pointerEvents="none">
          <Text style={[styles.stampText, { color: Colors.like }]}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStyle]} pointerEvents="none">
          <Text style={[styles.stampText, { color: Colors.pass }]}>NOPE</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.superStamp, superStyle]} pointerEvents="none">
          <Text style={[styles.stampText, { color: Colors.superlike }]}>SUPER</Text>
        </Animated.View>

        {/* Dark gradient */}
        <View style={styles.gradientOverlay} pointerEvents="none" />

        {/* New here badge */}
        <View style={styles.newHereBadge} pointerEvents="none">
          <View style={styles.newHereDot} />
          <Text style={styles.newHereText}>New here</Text>
        </View>

        {/* Distance badge */}
        <View style={styles.distanceBadge} pointerEvents="none">
          <PinSVG size={11} color={Colors.white} />
          <Text style={styles.distanceText}>{candidate.distanceKm} km</Text>
        </View>

        {/* Card footer */}
        <View style={styles.cardFooter} pointerEvents="none">
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {candidate.username}
              <Text style={styles.ageText}>, {candidate.age}</Text>
            </Text>
            <View style={styles.verifiedBadge}>
              <VerifiedSVG />
            </View>
          </View>
          {candidate.jobTitle ? (
            <Text style={styles.jobText} numberOfLines={1}>
              {candidate.jobTitle}
            </Text>
          ) : null}
          <View style={styles.tagsRow}>
            {candidate.interests.slice(0, 4).map((interest, i) => (
              <Tag key={i} label={interest} />
            ))}
            {candidate.interests.length > 4 && (
              <Tag label={`+${candidate.interests.length - 4}`} />
            )}
          </View>

          {/* Swipe up hint */}
          <View style={styles.swipeUpHint} pointerEvents="none">
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 19V5M5 12l7-7 7 7"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.swipeUpHintText}>Swipe up for full profile</Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

// ─── CardStack ────────────────────────────────────────────────────────────────
export const CardStack: React.FC<CardStackProps> = ({
  candidates,
  onSwipe,
  onEmpty,
  onExpandProfile,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndices, setPhotoIndices] = useState<Record<string, number>>({});

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const likeOpacity = useSharedValue(0);
  const nopeOpacity = useSharedValue(0);
  const superOpacity = useSharedValue(0);

  useEffect(() => {
    setCurrentIndex(0);
    translateX.value = 0;
    translateY.value = 0;
    likeOpacity.value = 0;
    nopeOpacity.value = 0;
    superOpacity.value = 0;
  }, [candidates]);

  const reset = () => {
    translateX.value = withSpring(0, { damping: 16, stiffness: 180 });
    translateY.value = withSpring(0, { damping: 16, stiffness: 180 });
    likeOpacity.value = 0;
    nopeOpacity.value = 0;
    superOpacity.value = 0;
  };

  const completeSwipe = (action: 'like' | 'pass' | 'superlike') => {
    const candidate = candidates[currentIndex];
    const nextIndex = currentIndex + 1;
    translateX.value = 0;
    translateY.value = 0;
    likeOpacity.value = 0;
    nopeOpacity.value = 0;
    superOpacity.value = 0;
    setCurrentIndex(nextIndex);
    if (candidate) onSwipe(action, candidate);
    if (nextIndex >= candidates.length) onEmpty();
  };

  const openFullProfile = () => {
    const candidate = candidates[currentIndex];
    if (candidate && onExpandProfile) {
      onExpandProfile(candidate);
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const { translationX: dx, translationY: dy } = event;

      // If clearly swiping upward: don't move card, show super stamp slightly
      if (dy < -40 && Math.abs(dy) > Math.abs(dx) * 1.5) {
        translateX.value = 0;
        translateY.value = 0;
        superOpacity.value = Math.min(1, Math.abs(dy) / 120);
        return;
      }

      // Horizontal swipe: move card + show stamps
      translateX.value = dx;
      translateY.value = dy * 0.2;
      superOpacity.value = 0;

      if (dx > 0) {
        likeOpacity.value = Math.min(1, dx / SWIPE_THRESHOLD);
        nopeOpacity.value = 0;
      } else {
        nopeOpacity.value = Math.min(1, Math.abs(dx) / SWIPE_THRESHOLD);
        likeOpacity.value = 0;
      }
    })
    .onEnd((event) => {
      const { translationX: dx, translationY: dy, velocityX, velocityY } = event;

      // ── Upward fling → open full profile modal ─────────────────────────────
      // Only trigger if the swipe is clearly vertical (not accidentally diagonal)
      const isUpwardFling =
        (dy < SWIPE_UP_THRESHOLD || velocityY < SWIPE_UP_VELOCITY) &&
        Math.abs(dy) > Math.abs(dx) * 1.5;

      if (isUpwardFling) {
        translateX.value = withSpring(0, { damping: 16, stiffness: 180 });
        translateY.value = withSpring(0, { damping: 16, stiffness: 180 });
        likeOpacity.value = 0;
        nopeOpacity.value = 0;
        superOpacity.value = 0;
        runOnJS(openFullProfile)();
        return;
      }

      // ── Swipe right → Like ────────────────────────────────────────────────
      if (dx > SWIPE_THRESHOLD || velocityX > 500) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 250 }, (finished) => {
          'worklet';
          if (finished) runOnJS(completeSwipe)('like');
        });
        return;
      }

      // ── Swipe left → Pass ────────────────────────────────────────────────
      if (dx < -SWIPE_THRESHOLD || velocityX < -500) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 250 }, (finished) => {
          'worklet';
          if (finished) runOnJS(completeSwipe)('pass');
        });
        return;
      }

      // ── Not enough → snap back ────────────────────────────────────────────
      runOnJS(reset)();
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-16, 0, 16],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    const drag = Math.max(Math.abs(translateX.value), Math.abs(translateY.value));
    return {
      transform: [{
        scale: interpolate(drag, [0, SWIPE_THRESHOLD], [0.94, 1], Extrapolation.CLAMP),
      }],
      opacity: interpolate(drag, [0, SWIPE_THRESHOLD], [0.82, 1], Extrapolation.CLAMP),
    };
  });

  const handlePhotoTap = (direction: 'left' | 'right', candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;
    const cur = photoIndices[candidateId] ?? 0;
    const total = candidate.photos.length;
    if (direction === 'right' && cur < total - 1) {
      setPhotoIndices(prev => ({ ...prev, [candidateId]: cur + 1 }));
    } else if (direction === 'left' && cur > 0) {
      setPhotoIndices(prev => ({ ...prev, [candidateId]: cur - 1 }));
    }
  };

  const currentCandidate = candidates[currentIndex];
  const nextCandidate = candidates[currentIndex + 1];

  if (!currentCandidate) return null;

  return (
    <View style={styles.container}>
      {/* ── Next card (peek) ── */}
      {nextCandidate && (
        <Animated.View style={[styles.card, styles.nextCard, nextCardStyle]}>
          <Image
            source={{ uri: nextCandidate.photos[0] }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.gradientOverlay} />
          <View style={styles.cardFooter} pointerEvents="none">
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>
                {nextCandidate.username}
                <Text style={styles.ageText}>, {nextCandidate.age}</Text>
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── Top swipeable card ── */}
      <SwipeCard
        candidate={currentCandidate}
        photoIndices={photoIndices}
        onPhotoTap={handlePhotoTap}
        likeOpacity={likeOpacity}
        nopeOpacity={nopeOpacity}
        superOpacity={superOpacity}
        cardStyle={cardAnimatedStyle}
        gesture={panGesture}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Card
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: Radius.card,
    overflow: 'hidden',
    backgroundColor: Colors.plum,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 8,
  },
  nextCard: {
    zIndex: 1,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },

  // Photo navigation
  photoTapLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '45%',
    height: '70%',
    zIndex: 5,
  },
  photoTapRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '45%',
    height: '70%',
    zIndex: 5,
  },
  photoIndicators: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  indicatorBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  indicatorActive: {
    backgroundColor: Colors.white,
  },

  // Stamps
  stamp: {
    position: 'absolute',
    borderWidth: 3.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    zIndex: 20,
  },
  likeStamp: {
    top: 52,
    left: 22,
    borderColor: Colors.like,
    transform: [{ rotate: '-15deg' }],
  },
  nopeStamp: {
    top: 52,
    right: 22,
    borderColor: Colors.pass,
    transform: [{ rotate: '15deg' }],
  },
  superStamp: {
    top: 90,
    alignSelf: 'center',
    left: CARD_WIDTH * 0.29,
    borderColor: Colors.superlike,
  },
  stampText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Gradient overlay
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 260,
    backgroundColor: 'rgba(38, 16, 28, 0.72)',
  },

  // Badges
  newHereBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    zIndex: 15,
  },
  newHereDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.magenta,
  },
  newHereText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.plum,
  },
  distanceBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    zIndex: 15,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },

  // Footer
  cardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    zIndex: 15,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  nameText: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.white,
    flexShrink: 1,
  },
  ageText: {
    fontWeight: '400',
    color: 'rgba(255,255,255,0.88)',
  },
  verifiedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  jobText: {
    fontSize: 13,
    color: Colors.blush,
    fontWeight: '500',
    marginBottom: 7,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },

  // Swipe up hint
  swipeUpHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  swipeUpHintText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
});
