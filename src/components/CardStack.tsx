import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';
import { Tag } from './Tag';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

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

  const position = useRef(new Animated.ValueXY()).current;
  const candidatesRef = useRef(candidates);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    candidatesRef.current = candidates;
    currentIndexRef.current = currentIndex;
  }, [candidates, currentIndex]);

  // Rotation based on horizontal drag
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ['-18deg', '0deg', '18deg'],
    extrapolate: 'clamp',
  });

  // Stamp Opacity interpolations
  const likeOpacity = position.x.interpolate({
    inputRange: [10, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -10],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const superlikeOpacity = position.y.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -10],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // PanResponder gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        const isUpwardSwipe =
          gestureState.dy < -70 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);

        if (isUpwardSwipe) {
          resetPosition();
          const activeCand = candidatesRef.current[currentIndexRef.current];
          if (activeCand && onExpandProfile) {
            onExpandProfile(activeCand);
          }
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const forceSwipe = (direction: 'right' | 'left' | 'up') => {
    let x = 0;
    let y = 0;

    if (direction === 'right') {
      x = SCREEN_WIDTH + 100;
    } else if (direction === 'left') {
      x = -SCREEN_WIDTH - 100;
    } else if (direction === 'up') {
      y = -SCREEN_HEIGHT - 100;
    }

    Animated.timing(position, {
      toValue: { x, y },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left' | 'up') => {
    const candidate = candidates[currentIndex];
    const actionMap = {
      right: 'like' as const,
      left: 'pass' as const,
      up: 'superlike' as const,
    };
    
    position.setValue({ x: 0, y: 0 });
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    if (candidate) {
      onSwipe(actionMap[direction], candidate);
    }

    if (nextIndex >= candidates.length) {
      onEmpty();
    }
  };

  const handlePhotoTap = (candidateId: string, totalPhotos: number, direction: 'left' | 'right') => {
    const currentPhoto = photoIndices[candidateId] || 0;
    if (direction === 'right' && currentPhoto < totalPhotos - 1) {
      setPhotoIndices({ ...photoIndices, [candidateId]: currentPhoto + 1 });
    } else if (direction === 'left' && currentPhoto > 0) {
      setPhotoIndices({ ...photoIndices, [candidateId]: currentPhoto - 1 });
    }
  };

  const currentCandidate = candidates[currentIndex];

  if (!currentCandidate || currentIndex >= candidates.length) {
    return null;
  }

  const currentPhotoIdx = photoIndices[currentCandidate.id] || 0;
  const currentPhotoUrl = currentCandidate.photos[currentPhotoIdx] || currentCandidate.photos[0];

  return (
    <View style={styles.container}>
      {/* Background Deck Card Preview */}
      {candidates[currentIndex + 1] && (
        <View style={[styles.card, styles.nextCard]}>
          <Image
            source={{ uri: candidates[currentIndex + 1].photos[0] }}
            style={styles.cardImage}
          />
          <View style={styles.gradientOverlay} />
          <View style={styles.cardContent}>
            <Text style={styles.nameText}>
              {candidates[currentIndex + 1].username}, {candidates[currentIndex + 1].age}
            </Text>
          </View>
        </View>
      )}

      {/* Top Active Card */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate: rotate },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableWithoutFeedback
          onPress={(e) => {
            const x = e.nativeEvent.locationX;
            handlePhotoTap(
              currentCandidate.id,
              currentCandidate.photos.length,
              x > SCREEN_WIDTH * 0.45 ? 'right' : 'left'
            );
          }}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: currentPhotoUrl }} style={styles.cardImage} />

            {/* Photo Segment Indicators */}
            {currentCandidate.photos.length > 1 && (
              <View style={styles.photoIndicators}>
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
            )}

            {/* Stamp Overlays */}
            <Animated.View style={[styles.stampContainer, styles.likeStamp, { opacity: likeOpacity }]}>
              <Text style={[styles.stampText, { color: Colors.likeGreen }]}>PING!</Text>
            </Animated.View>

            <Animated.View style={[styles.stampContainer, styles.passStamp, { opacity: passOpacity }]}>
              <Text style={[styles.stampText, { color: Colors.passRed }]}>NOPE</Text>
            </Animated.View>

            <Animated.View style={[styles.stampContainer, styles.superlikeStamp, { opacity: superlikeOpacity }]}>
              <Text style={[styles.stampText, { color: Colors.gold }]}>SUPER PING</Text>
            </Animated.View>

            {/* Dark Gradient Text Overlay */}
            <View style={styles.gradientOverlay} />

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
        </TouchableWithoutFeedback>
      </Animated.View>

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
    transform: [{ scale: 0.95 }, { translateY: 10 }],
    opacity: 0.85,
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
    borderColor: Colors.likeGreen,
    transform: [{ rotate: '-15deg' }],
  },
  passStamp: {
    right: 30,
    borderColor: Colors.passRed,
    transform: [{ rotate: '15deg' }],
  },
  superlikeStamp: {
    top: 100,
    alignSelf: 'center',
    borderColor: Colors.gold,
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
    borderColor: Colors.gold,
  },
  likeBtn: {
    backgroundColor: Colors.magenta,
  },
  btnIcon: {
    fontSize: 24,
  },
  headerRightBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
});
