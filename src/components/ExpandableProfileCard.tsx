import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  BackHandler,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
  useAnimatedRef,
  measure,
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';
import { Tag } from './Tag';
import { CandidateProfile } from './CardStack';

// ─── SVG icon helpers (no emoji) ──────────────────────────────────────────
const PassBtnIcon = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1={18} y1={6} x2={6} y2={18} stroke={Colors.coral} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1={6} y1={6} x2={18} y2={18} stroke={Colors.coral} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

const HeartBtnIcon = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      fill={Colors.white}
    />
  </Svg>
);

const StarBtnIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={Colors.magenta}
    />
  </Svg>
);

const PinBtnIcon = ({ size = 14, color = Colors.magenta }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={2} />
  </Svg>
);

const BriefcaseIcon = ({ size = 14, color = Colors.textMuted }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Line x1={18} y1={6} x2={6} y2={18} stroke={Colors.white} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1={6} y1={6} x2={18} y2={18} stroke={Colors.white} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sensible gesture thresholds
const EXPAND_DY_THRESHOLD = -60;
const DOMINANCE_RATIO = 1.5;
const SHRINK_DISMISS_THRESHOLD = SCREEN_HEIGHT * 0.22;
const SHRINK_VELOCITY_THRESHOLD = 500;

export interface CardRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ExpandableProfileCardProps {
  candidate: CandidateProfile;
  isTopCard: boolean;
  cardAnimatedStyle?: any;
  panGesture?: any; // Existing swipe gesture passed from parent stack or composed
  children?: React.ReactNode;
  onLike?: () => void;
  onPass?: () => void;
  onSuperLike?: () => void;
  onExpandChange?: (isExpanded: boolean) => void;
}

export const ExpandableProfileCard: React.FC<ExpandableProfileCardProps> = ({
  candidate,
  isTopCard,
  cardAnimatedStyle,
  panGesture: externalPanGesture,
  children,
  onLike,
  onPass,
  onSuperLike,
  onExpandChange,
}) => {
  const [isExpandedState, setIsExpandedState] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isScrollAtTop, setIsScrollAtTop] = useState(true);

  const containerRef = useAnimatedRef<Animated.View>();

  // Card origin rect captured before expansion
  const cardRect = useSharedValue<CardRect>({
    x: (SCREEN_WIDTH - SCREEN_WIDTH * 0.92) / 2,
    y: (SCREEN_HEIGHT - SCREEN_HEIGHT * 0.64) / 2,
    width: SCREEN_WIDTH * 0.92,
    height: SCREEN_HEIGHT * 0.64,
  });

  // Master Progress SharedValue (0 = collapsed in stack, 1 = full screen expanded)
  const progress = useSharedValue(0);
  const shrinkDragY = useSharedValue(0);

  const notifyExpandChange = (expanded: boolean) => {
    setIsExpandedState(expanded);
    if (onExpandChange) {
      onExpandChange(expanded);
    }
  };

  const measureCardOrigin = () => {
    'worklet';
    const measured = measure(containerRef);
    if (measured) {
      cardRect.value = {
        x: measured.pageX,
        y: measured.pageY,
        width: measured.width,
        height: measured.height,
      };
    }
  };

  const triggerExpand = () => {
    'worklet';
    measureCardOrigin();
    progress.value = withSpring(1, {
      damping: 18,
      stiffness: 140,
      mass: 0.8,
    }, (finished) => {
      if (finished) {
        runOnJS(notifyExpandChange)(true);
      }
    });
  };

  const triggerCollapse = () => {
    'worklet';
    shrinkDragY.value = withTiming(0, { duration: 150 });
    progress.value = withSpring(0, {
      damping: 20,
      stiffness: 160,
      mass: 0.9,
    }, (finished) => {
      if (finished) {
        runOnJS(notifyExpandChange)(false);
      }
    });
  };

  // ── Android hardware back button: collapse card instead of exiting app ──────
  const handleCollapseFromJS = useCallback(() => {
    // triggerCollapse is a worklet — call it via runOnUI so it runs on the UI thread
    shrinkDragY.value = withTiming(0, { duration: 150 });
    progress.value = withSpring(0, {
      damping: 20,
      stiffness: 160,
      mass: 0.9,
    }, (finished) => {
      if (finished) {
        runOnJS(notifyExpandChange)(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!isExpandedState) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      // Consume the back event and collapse the card
      handleCollapseFromJS();
      return true; // prevents default back navigation
    });

    return () => subscription.remove();
  }, [isExpandedState, handleCollapseFromJS]);

  // Upward Expand Pan Gesture Detection
  const expandPanGesture = Gesture.Pan()
    .enabled(isTopCard && !isExpandedState)
    .onUpdate((event) => {
      const dy = event.translationY;
      const dx = event.translationX;

      // Detect if vertical swipe-up clearly dominates horizontal gesture
      if (dy < EXPAND_DY_THRESHOLD && Math.abs(dy) > Math.abs(dx) * DOMINANCE_RATIO) {
        // Trigger continuous expansion directly on UI thread
        triggerExpand();
      }
    });

  // Combined gesture for top card: external horizontal swipe + vertical expand
  const combinedCardGesture = externalPanGesture
    ? Gesture.Simultaneous(externalPanGesture, expandPanGesture)
    : expandPanGesture;

  // Downward Shrink Drag Gesture when full-screen expanded
  const shrinkPanGesture = Gesture.Pan()
    .enabled(isExpandedState)
    .onUpdate((event) => {
      // Only track pull-down when scrolled to top or pulling downwards
      if (event.translationY > 0) {
        shrinkDragY.value = event.translationY;
        const dragRatio = event.translationY / SCREEN_HEIGHT;
        progress.value = Math.max(0, 1 - dragRatio * 1.2);
      }
    })
    .onEnd((event) => {
      if (
        event.translationY > SHRINK_DISMISS_THRESHOLD ||
        event.velocityY > SHRINK_VELOCITY_THRESHOLD
      ) {
        triggerCollapse();
      } else {
        // Spring back to full expanded view
        shrinkDragY.value = withSpring(0);
        progress.value = withSpring(1, { damping: 18, stiffness: 150 });
      }
    });

  // Animated style for morphing card container using single progress SharedValue
  const animatedMorphStyle = useAnimatedStyle(() => {
    const p = progress.value;

    // Interpolate position and size from origin rect to full screen
    const left = interpolate(p, [0, 1], [cardRect.value.x, 0]);
    const top = interpolate(p, [0, 1], [cardRect.value.y, 0]) + shrinkDragY.value * 0.3;
    const width = interpolate(p, [0, 1], [cardRect.value.width, SCREEN_WIDTH]);
    const height = interpolate(p, [0, 1], [cardRect.value.height, SCREEN_HEIGHT]);
    const borderRadius = interpolate(p, [0, 1], [Radius.card, 0]);

    // Scale effect during drag dismiss
    const scale = interpolate(shrinkDragY.value, [0, SCREEN_HEIGHT], [1, 0.88], Extrapolation.CLAMP);

    return {
      position: p > 0 ? 'absolute' : 'relative',
      left: p > 0 ? left : undefined,
      top: p > 0 ? top : undefined,
      width: p > 0 ? width : '100%',
      height: p > 0 ? height : '100%',
      borderRadius,
      transform: [{ scale }],
      zIndex: p > 0 ? 1000 : 1,
      elevation: p > 0 ? 20 : 6,
    };
  });

  // Interpolate scrim / dimming background opacity
  const scrimAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0, 0.85], Extrapolation.CLAMP);
    return {
      opacity,
      pointerEvents: progress.value > 0 ? 'auto' : 'none',
    };
  });

  // Content stagger / delay fade-in (begins when morph is ~70% complete)
  const fullContentAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0.7, 1], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(progress.value, [0.7, 1], [30, 0], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    setIsScrollAtTop(y <= 2);
  };

  const currentPhotoUrl =
    candidate.photos && candidate.photos[activePhotoIdx]
      ? candidate.photos[activePhotoIdx]
      : candidate.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800';

  return (
    <>
      {/* Background Dimming Scrim Overlay */}
      <Animated.View style={[styles.scrim, scrimAnimatedStyle]} pointerEvents="none" />

      {/* Main Expandable Morph Container */}
      <GestureDetector gesture={isExpandedState ? shrinkPanGesture : combinedCardGesture}>
        <Animated.View
          ref={containerRef}
          style={[
            styles.cardContainer,
            !isExpandedState && cardAnimatedStyle,
            animatedMorphStyle,
          ]}
          collapsable={false}
        >
          {isExpandedState ? <StatusBar barStyle="light-content" animated /> : null}

          {/* Full Screen Header Drag Handle Bar (Visible when expanded) */}
          {isExpandedState && (
            <View style={styles.dragHandleHeader}>
              <View style={styles.dragHandleBar} />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => triggerCollapse()}
                style={styles.closeCircleBtn}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>
          )}

          {/* Image & Card Media — full bleed in collapsed, 55% in expanded */}
          <View style={[styles.mediaWrapper, isExpandedState && styles.mediaWrapperExpanded]}>
            <Image source={{ uri: currentPhotoUrl }} style={styles.cardImage} />

            {/* Dark gradient for visual continuity */}
            <View style={styles.gradientOverlay} />

            {/* Photo Indicators */}
            {candidate.photos && candidate.photos.length > 1 && (
              <View style={styles.photoIndicators} pointerEvents="none">
                {candidate.photos.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.indicatorBar,
                      i === activePhotoIdx && styles.indicatorActive,
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Quick Hero Overlay Info — only shown in expanded state.
                In collapsed mode, CardStack children provide the name/info footer. */}
            {isExpandedState && (
              <View style={styles.heroOverlayContent}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>
                    {candidate.username}, <Text style={styles.ageText}>{candidate.age}</Text>
                  </Text>
                  <View style={styles.distanceBadge}>
                    <PinBtnIcon size={13} color={Colors.white} />
                    <Text style={styles.distanceText}>{candidate.distanceKm} km</Text>
                  </View>
                </View>
                {candidate.jobTitle ? (
                  <View style={styles.jobRow}>
                    <BriefcaseIcon size={13} color={Colors.blush} />
                    <Text style={styles.jobText}>{candidate.jobTitle}</Text>
                  </View>
                ) : null}
              </View>
            )}

            {/* Children: stamps, "New here" badge, distance badge, card footer — placed absolutely on top of photo */}
            {!isExpandedState && children}
          </View>

          {/* Staggered Full Profile Bio Details (Fades in at 70% expansion) */}
          {isExpandedState ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.expandedScrollContent}
            >
              <Animated.View style={fullContentAnimatedStyle}>
                {/* About Section */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionHeaderTitle}>About Me</Text>
                  <Text style={styles.sectionBodyText}>
                    {candidate.bio ||
                      'Looking for someone to explore hidden coffee spots, talk about design, and go on weekend road trips! ☕✨'}
                  </Text>
                </View>

                {/* Additional Info Badges */}
                <View style={styles.infoGrid}>
                  {candidate.location ? (
                    <View style={styles.infoGridItem}>
                      <Text style={styles.infoGridLabel}>Location</Text>
                      <Text style={styles.infoGridValue}>{candidate.location}</Text>
                    </View>
                  ) : null}
                  {candidate.height ? (
                    <View style={styles.infoGridItem}>
                      <Text style={styles.infoGridLabel}>Height</Text>
                      <Text style={styles.infoGridValue}>{candidate.height}</Text>
                    </View>
                  ) : null}
                  {candidate.zodiac ? (
                    <View style={styles.infoGridItem}>
                      <Text style={styles.infoGridLabel}>Zodiac</Text>
                      <Text style={styles.infoGridValue}>{candidate.zodiac}</Text>
                    </View>
                  ) : null}
                  {candidate.education ? (
                    <View style={styles.infoGridItem}>
                      <Text style={styles.infoGridLabel}>Education</Text>
                      <Text style={styles.infoGridValue}>{candidate.education}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Interests Pills */}
                {candidate.interests && candidate.interests.length > 0 && (
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionHeaderTitle}>Passions & Interests</Text>
                    <View style={styles.tagsContainer}>
                      {candidate.interests.map((interest, idx) => (
                        <Tag key={idx} label={interest} />
                      ))}
                    </View>
                  </View>
                )}

                {/* Prompts Cards */}
                {candidate.prompts && candidate.prompts.length > 0 && (
                  <View style={styles.sectionBox}>
                    {candidate.prompts.map((p, idx) => (
                      <View key={idx} style={styles.promptCard}>
                        <Text style={styles.promptQuestion}>{p.question}</Text>
                        <Text style={styles.promptAnswer}>{p.answer}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action Button Controls */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      triggerCollapse();
                      if (onPass) onPass();
                    }}
                    style={[styles.fullActionBtn, styles.passBorderBtn]}
                  >
                    <PassBtnIcon size={26} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      triggerCollapse();
                      if (onSuperLike) onSuperLike();
                    }}
                    style={[styles.fullActionBtn, styles.superBorderBtn]}
                  >
                    <StarBtnIcon size={22} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      triggerCollapse();
                      if (onLike) onLike();
                    }}
                    style={[styles.fullActionBtn, styles.likeFilledBtn]}
                  >
                    <HeartBtnIcon size={26} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </ScrollView>
          ) : null}
        </Animated.View>
      </GestureDetector>
    </>
  );
};

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 10, 15, 0.75)',
    zIndex: 900,
  },
  cardContainer: {
    backgroundColor: Colors.white,
    overflow: 'hidden',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },
  dragHandleHeader: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dragHandleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  closeCircleBtn: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  mediaWrapper: {
    width: '100%',
    flex: 1,           // Full-bleed by default (collapsed card)
    position: 'relative',
    backgroundColor: '#1C1318',
  },
  mediaWrapperExpanded: {
    flex: 0,
    height: '55%',     // 55% height only in full-screen expanded view
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'rgba(35, 18, 27, 0.65)',
  },
  photoIndicators: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
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
  heroOverlayContent: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    zIndex: 15,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  jobText: {
    fontSize: 13,
    color: Colors.blush,
    fontWeight: '500',
  },
  expandedScrollContent: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: Colors.cream,
  },
  sectionBox: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.plum,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionBodyText: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.textDark,
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  infoGridItem: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoGridLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
  },
  infoGridValue: {
    ...Typography.body,
    color: Colors.plum,
    fontWeight: '600',
    fontSize: 13,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  promptCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 74, 0.12)',
  },
  promptQuestion: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.coral,
    fontWeight: '700',
    marginBottom: 6,
  },
  promptAnswer: {
    ...Typography.heading,
    fontSize: 16,
    color: Colors.plum,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
    paddingBottom: 20,
  },
  fullActionBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  passBorderBtn: {
    borderWidth: 2,
    borderColor: Colors.coral,
  },
  superBorderBtn: {
    borderWidth: 2,
    borderColor: Colors.magenta,
  },
  likeFilledBtn: {
    backgroundColor: Colors.magenta,
  },
  actionIconText: {
    fontSize: 24,
  },
});
