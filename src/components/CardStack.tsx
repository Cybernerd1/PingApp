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
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';
import { Tag } from './Tag';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const SWIPE_UP_THRESHOLD = -80;

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

  useEffect(() => {
    setCurrentIndex(0);
    translateX.value = 0;
    translateY.value = 0;
  }, [candidates]);

  const handleSwipeComplete = (action: 'like' | 'pass' | 'superlike') => {
    const candidate = candidates[currentIndex];
    const nextIndex = currentIndex + 1;

    translateX.value = 0;
    translateY.value = 0;
    setCurrentIndex(nextIndex);

    if (candidate) {
      onSwipe(action, candidate);
    }

    if (nextIndex >= candidates.length) {
      onEmpty();
    }
  };

  const forceSwipe = (direction: 'right' | 'left' | 'up') => {
    let targetX = 0;
    let targetY = 0;
    let action: 'like' | 'pass' | 'superlike' = 'like';

    if (direction === 'right') {
      targetX = SCREEN_WIDTH * 1.5;
      action = 'like';
    } else if (direction === 'left') {
      targetX = -SCREEN_WIDTH * 1.5;
      action = 'pass';
    } else if (direction === 'up') {
      targetY = -SCREEN_HEIGHT * 1.5;
      action = 'superlike';
    }

    translateX.value = withTiming(targetX, { duration: 250 });
    translateY.value = withTiming(targetY, { duration: 250 }, (finished) => {
      'worklet';
      if (finished) {
        runOnJS(handleSwipeComplete)(action);
      }
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      // Swipe Up -> Expand Full Profile Fullscreen
      if (
        event.translationY < SWIPE_UP_THRESHOLD &&
        Math.abs(event.translationX) < SCREEN_WIDTH * 0.35
      ) {
        translateX.value = withSpring(0, { damping: 16, stiffness: 180 });
        translateY.value = withSpring(0, { damping: 16, stiffness: 180 });
        if (onExpandProfile && currentCandidate) {
          runOnJS(onExpandProfile)(currentCandidate);
        }
        return;
      }

      // Swipe Right (Like)
      if (event.translationX > SWIPE_THRESHOLD || event.velocityX > 500) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 250 }, (finished) => {
          'worklet';
          if (finished) runOnJS(handleSwipeComplete)('like');
        });
        return;
      }

      // Swipe Left (Pass)
      if (event.translationX < -SWIPE_THRESHOLD || event.velocityX < -500) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 250 }, (finished) => {
          'worklet';
          if (finished) runOnJS(handleSwipeComplete)('pass');
        });
        return;
      }

      // Reset card position if swipe threshold is not met
      translateX.value = withSpring(0, { damping: 16, stiffness: 180 });
      translateY.value = withSpring(0, { damping: 16, stiffness: 180 });
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-18, 0, 18],
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

  const likeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [15, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const passStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -15],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const superlikeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [SWIPE_UP_THRESHOLD, -15],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const nextCardAnimatedStyle = useAnimatedStyle(() => {
    const dragDistance = Math.max(
      Math.abs(translateX.value),
      Math.abs(translateY.value)
    );
    const scale = interpolate(
      dragDistance,
      [0, SWIPE_THRESHOLD],
      [0.94, 1],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      dragDistance,
      [0, SWIPE_THRESHOLD],
      [0.85, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const handlePhotoTap = (direction: 'left' | 'right') => {
    const candidate = candidates[currentIndex];
    if (!candidate) return;
    const currentPhoto = photoIndices[candidate.id] || 0;
    const totalPhotos = candidate.photos.length;

    if (direction === 'right' && currentPhoto < totalPhotos - 1) {
      setPhotoIndices((prev) => ({ ...prev, [candidate.id]: currentPhoto + 1 }));
    } else if (direction === 'left' && currentPhoto > 0) {
      setPhotoIndices((prev) => ({ ...prev, [candidate.id]: currentPhoto - 1 }));
    }
  };

  const currentCandidate = candidates[currentIndex];
  const nextCandidate = candidates[currentIndex + 1];

  if (!currentCandidate || currentIndex >= candidates.length) {
    return null;
  }

  const currentPhotoIdx = photoIndices[currentCandidate.id] || 0;
  const currentPhotoUrl = currentCandidate.photos[currentPhotoIdx] || currentCandidate.photos[0];

  return (
    <View style={styles.container}>
      {/* Background Next Card Preview */}
      {nextCandidate && (
        <Animated.View style={[styles.card, styles.nextCard, nextCardAnimatedStyle]}>
          <Image
            source={{ uri: nextCandidate.photos[0] }}
            style={styles.cardImage}
          />
          <View style={styles.gradientOverlay} />
          <View style={styles.cardContent}>
            <Text style={styles.nameText}>
              {nextCandidate.username}, {nextCandidate.age}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Top Active Card with Gesture Handler */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: currentPhotoUrl }} style={styles.cardImage} />

            {/* Tap areas for photo switching */}
            {currentCandidate.photos.length > 1 && (
              <>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => handlePhotoTap('left')}
                  style={styles.photoTapLeft}
                />
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => handlePhotoTap('right')}
                  style={styles.photoTapRight}
                />

                {/* Photo Segment Indicators */}
                <View style={styles.photoIndicators} pointerEvents="none">
                  {currentCandidate.photos.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.indicatorBar,
                        i === currentPhotoIdx && styles.indicatorActive,
                      ]}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Stamp Overlays */}
            <Animated.View style={[styles.stampContainer, styles.likeStamp, likeStampStyle]} pointerEvents="none">
              <Text style={[styles.stampText, { color: Colors.like }]}>PING!</Text>
            </Animated.View>

            <Animated.View style={[styles.stampContainer, styles.passStamp, passStampStyle]} pointerEvents="none">
              <Text style={[styles.stampText, { color: Colors.pass }]}>NOPE</Text>
            </Animated.View>

            <Animated.View style={[styles.stampContainer, styles.superlikeStamp, superlikeStampStyle]} pointerEvents="none">
              <Text style={[styles.stampText, { color: Colors.magenta }]}>SUPER PING</Text>
            </Animated.View>

            {/* Dark Gradient Text Overlay */}
            <View style={styles.gradientOverlay} pointerEvents="none" />

            {/* Card Content Footer */}
            <View style={styles.cardContent}>
              <View style={styles.rowHeader}>
                <Text style={styles.nameText}>
                  {currentCandidate.username},{' '}
                  <Text style={styles.ageText}>{currentCandidate.age}</Text>
                </Text>
                <View style={styles.headerRightBadgeGroup}>
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>📍 {currentCandidate.distanceKm} km</Text>
                  </View>
                  {onExpandProfile && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => onExpandProfile(currentCandidate)}
                      style={styles.infoButton}
                    >
                      <Text style={styles.infoButtonText}>ℹ</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {currentCandidate.jobTitle ? (
                <Text style={styles.jobText}>💼 {currentCandidate.jobTitle}</Text>
              ) : null}

              <Text style={styles.bioText} numberOfLines={2}>
                {currentCandidate.bio}
              </Text>

              <View style={styles.tagsRow}>
                {currentCandidate.interests.map((interest, idx) => (
                  <Tag key={idx} label={interest} />
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Floating Action Controls */}
      <View style={styles.actionControls}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => forceSwipe('left')}
          style={[styles.actionBtn, styles.passBtn]}
        >
          <Text style={styles.btnIcon}>✖</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => forceSwipe('up')}
          style={[styles.actionBtn, styles.superBtn]}
        >
          <Text style={styles.btnIcon}>⭐</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => forceSwipe('right')}
          style={[styles.actionBtn, styles.likeBtn]}
        >
          <Text style={styles.btnIcon}>❤️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: SCREEN_WIDTH * 0.92,
    height: SCREEN_HEIGHT * 0.64,
    borderRadius: Radius.card,
    backgroundColor: Colors.white,
    position: 'absolute',
    overflow: 'hidden',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  nextCard: {
    zIndex: -1,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
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
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorActive: {
    backgroundColor: Colors.white,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: 'rgba(43, 22, 32, 0.65)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 15,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameText: {
    ...Typography.heading,
    fontSize: 26,
    color: Colors.white,
    fontWeight: '700',
  },
  ageText: {
    fontWeight: '400',
  },
  headerRightBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  distanceText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  infoButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  jobText: {
    ...Typography.caption,
    color: Colors.blush,
    marginBottom: 6,
  },
  bioText: {
    ...Typography.body,
    color: Colors.white,
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 19,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stampContainer: {
    position: 'absolute',
    top: 40,
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    zIndex: 20,
  },
  likeStamp: {
    left: 30,
    borderColor: Colors.like,
    transform: [{ rotate: '-15deg' }],
  },
  passStamp: {
    right: 30,
    borderColor: Colors.pass,
    transform: [{ rotate: '15deg' }],
  },
  superlikeStamp: {
    top: 100,
    alignSelf: 'center',
    borderColor: Colors.magenta,
  },
  stampText: {
    fontSize: 28,
    fontWeight: '900',
  },
  actionControls: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    zIndex: 30,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  passBtn: {
    borderWidth: 2,
    borderColor: Colors.coral,
  },
  superBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.magenta,
  },
  likeBtn: {
    backgroundColor: Colors.magenta,
  },
  btnIcon: {
    fontSize: 24,
  },
});
