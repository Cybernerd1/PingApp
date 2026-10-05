import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';
import {
  OnboardingSlide1SVG,
  OnboardingSlide2SVG,
  OnboardingSlide3SVG,
} from '../components/illustrations/OnboardingIllustrations';

const PING_LOGO_FULL = require('../assets/images/ping_logo_full.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  illustration: React.ReactNode;
  ctaLabel: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Real People.\nReal Conversations.',
    subtitle:
      'Chat, share moments and connect with people around you.',
    illustration: <OnboardingSlide1SVG width={SCREEN_WIDTH * 0.78} height={240} />,
    ctaLabel: 'Next →',
  },
  {
    id: '2',
    title: 'Find People\nAround You',
    subtitle:
      'Discover and chat with people nearby who share your interests.',
    illustration: <OnboardingSlide3SVG width={SCREEN_WIDTH * 0.78} height={240} />,
    ctaLabel: 'Next →',
  },
  {
    id: '3',
    title: 'Meaningful\nConnections',
    subtitle:
      'Text, share photos, voice notes and more. Keep it simple and real.',
    illustration: <OnboardingSlide2SVG width={SCREEN_WIDTH * 0.78} height={240} />,
    ctaLabel: 'Get Started',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    if (slideIndex !== activeSlide && slideIndex >= 0 && slideIndex < ONBOARDING_SLIDES.length) {
      setActiveSlide(slideIndex);
    }
  };

  const animateButtonPress = (onPress: () => void) => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(onPress);
  };

  const handleNext = () => {
    animateButtonPress(() => {
      if (activeSlide < ONBOARDING_SLIDES.length - 1) {
        flatListRef.current?.scrollToIndex({
          index: activeSlide + 1,
          animated: true,
        });
      } else {
        markSeenAndComplete();
      }
    });
  };

  const markSeenAndComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch (_) {}
    onComplete();
  }, [onComplete]);

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      {/* Illustration Area */}
      <View style={styles.illustrationContainer}>
        {/* Decorative card bg */}
        <View style={styles.illustrationCard}>
          {item.illustration}
        </View>
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.subtitleText}>{item.subtitle}</Text>
      </View>
    </View>
  );

  const currentSlide = ONBOARDING_SLIDES[activeSlide];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Decorative blobs */}
        <View style={[styles.blob, styles.blobTR]} />
        <View style={[styles.blob, styles.blobBL]} />

        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <Image
          source={PING_LOGO_FULL}
          style={styles.brandLogoImage}
          resizeMode="contain"
        />
          {activeSlide < ONBOARDING_SLIDES.length - 1 ? (
            <TouchableOpacity activeOpacity={0.7} onPress={markSeenAndComplete} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 50 }} />
          )}
        </View>

        {/* Swipeable Carousel */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.flatList}
        />

        {/* Bottom: Dots + CTA */}
        <View style={styles.footerContainer}>
          {/* Dots */}
          <View style={styles.dotsContainer}>
            {ONBOARDING_SLIDES.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === activeSlide && styles.activeDot,
                ]}
              />
            ))}
          </View>

          {/* CTA Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleNext}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaButtonText}>{currentSlide.ctaLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  blob: {
    position: 'absolute',
    borderRadius: 130,
    opacity: 0.18,
  },
  blobTR: {
    width: 220,
    height: 220,
    top: -50,
    right: -60,
    backgroundColor: Colors.coral,
  },
  blobBL: {
    width: 180,
    height: 180,
    bottom: 120,
    left: -60,
    backgroundColor: Colors.peach,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 4,
  },
  brandLogoImage: {
    height: 30,
    width: 100,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    ...Typography.bodyStrong,
    color: Colors.magenta,
    fontSize: 15,
    fontWeight: '600',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    flex: 1,
  },
  illustrationContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 28,
  },
  illustrationCard: {
    width: SCREEN_WIDTH * 0.85,
    height: 260,
    borderRadius: 32,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  titleText: {
    ...Typography.display,
    fontSize: 30,
    color: Colors.plum,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
    fontWeight: '800',
  },
  subtitleText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 300,
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 20,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.blush,
  },
  activeDot: {
    width: 28,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.magenta,
  },
  ctaButton: {
    width: SCREEN_WIDTH - 48,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.magenta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
