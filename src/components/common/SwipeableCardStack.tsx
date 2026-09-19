import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;
const UPWARD_SWIPE_THRESHOLD = -80;

export interface CardData {
  id: string;
  name: string;
  age: number;
  bio?: string;
  location?: string;
  distance?: string;
  interests?: string[];
  photos?: string[];
  [key: string]: any;
}

export interface SwipeableCardStackProps<T = CardData> {
  data: T[];
  renderCard: (item: T, isExpanded: boolean, toggleExpand: () => void) => React.ReactNode;
  onSwipe?: (direction: 'left' | 'right' | 'superlike', item: T) => void;
  swipeThreshold?: number;
  onEmpty?: () => React.ReactNode;
}

export const SwipeableCardStack = <T extends { id: string }>({
  data,
  renderCard,
  onSwipe,
  swipeThreshold = DEFAULT_SWIPE_THRESHOLD,
  onEmpty,
}: SwipeableCardStackProps<T>) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const expandProgress = useSharedValue(0); // 0 = standard card, 1 = expanded profile view

  const currentItem = data[currentIndex];
  const nextItem = data[currentIndex + 1];

  const handleSwipeComplete = (dir: 'left' | 'right' | 'superlike') => {
    const item = data[currentIndex];
    setCurrentIndex((prev) => prev + 1);
    translateX.value = 0;
    translateY.value = 0;
    expandProgress.value = 0;
    setIsExpanded(false);
    if (item && onSwipe) {
      onSwipe(dir, item);
    }
  };

  const toggleExpand = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    expandProgress.value = withSpring(nextState ? 1 : 0, {
      damping: 18,
      stiffness: 180,
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // If expanded, track vertical pull-down to shrink
      if (expandProgress.value > 0.5) {
        if (event.translationY > 0) {
          translateY.value = event.translationY;
        }
        return;
      }

      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      // Expanded state release check
      if (expandProgress.value > 0.5) {
        if (event.translationY > 90 || event.velocityY > 400) {
          expandProgress.value = withSpring(0, { damping: 18, stiffness: 180 });
          translateY.value = withSpring(0);
          runOnJS(setIsExpanded)(false);
        } else {
          translateY.value = withSpring(0);
        }
        return;
      }

      // Upward Swipe -> Expand Profile
      if (event.translationY < UPWARD_SWIPE_THRESHOLD && Math.abs(event.translationX) < 70) {
        expandProgress.value = withSpring(1, { damping: 18, stiffness: 180 });
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        runOnJS(setIsExpanded)(true);
        return;
      }

      // Horizontal Swipe Check (Left / Right)
      if (Math.abs(event.translationX) > swipeThreshold || Math.abs(event.velocityX) > 750) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        const targetX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

        translateX.value = withSpring(
          targetX,
          { velocity: event.velocityX, damping: 20, stiffness: 150 },
          (finished) => {
            if (finished) {
              runOnJS(handleSwipeComplete)(direction);
            }
          }
        );
      } else {
        // Spring back to center
        translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      }
    });

  const topCardAnimatedStyle = useAnimatedStyle(() => {
    // Rotation proportional to horizontal drag distance
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-15, 0, 15],
      Extrapolation.CLAMP
    );

    // Dynamic width during upward expansion (spreads to screen width)
    const cardWidth = interpolate(
      expandProgress.value,
      [0, 1],
      [SCREEN_WIDTH - 32, SCREEN_WIDTH]
    );

    const borderRadius = interpolate(
      expandProgress.value,
      [0, 1],
      [24, 0]
    );

    const translateYOffset = interpolate(
      expandProgress.value,
      [0, 1],
      [translateY.value, 0]
    );

    return {
      width: cardWidth,
      borderRadius,
      transform: [
        { translateX: translateX.value },
        { translateY: translateYOffset },
        { rotate: `${rotate * (1 - expandProgress.value)}deg` },
        { scale: interpolate(expandProgress.value, [0, 1], [1, 1.02]) },
      ],
    };
  });

  const nextCardAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, swipeThreshold],
      [0.92, 1],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, swipeThreshold],
      [0.6, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity: (1 - expandProgress.value) * opacity,
    };
  });

  if (!currentItem) {
    return (
      <View style={styles.emptyContainer}>
        {onEmpty ? (
          onEmpty()
        ) : (
          <View style={styles.defaultEmpty}>
            <Text style={styles.emptyTitle}>No More Profiles!</Text>
            <Text style={styles.emptySubtitle}>Check back later for new matches nearby.</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Next Card */}
      {nextItem && (
        <Animated.View style={[styles.cardWrapper, styles.nextCard, nextCardAnimatedStyle]}>
          {renderCard(nextItem, false, () => {})}
        </Animated.View>
      )}

      {/* Top Active Card with Pan Gesture */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cardWrapper, topCardAnimatedStyle]}>
          {renderCard(currentItem, isExpanded, toggleExpand)}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  nextCard: {
    zIndex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  defaultEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.plum,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.plum,
    opacity: 0.7,
    textAlign: 'center',
  },
});
