import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';
import { Button } from '../components/Button';
import {
  OnboardingSlide1SVG,
  OnboardingSlide2SVG,
  OnboardingSlide3SVG,
} from '../components/illustrations/OnboardingIllustrations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  illustration: React.ReactNode;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Real People.\nHappier Conversations.',
    subtitle:
      'Connect with genuine people around you in a warm, low-pressure space built for real chemistry.',
    illustration: <OnboardingSlide1SVG width={SCREEN_WIDTH * 0.75} height={220} />,
  },
  {
    id: '2',
    title: 'It Starts With a Ping ⚡',
    subtitle:
      'Break the ice with fun prompt cards, instant voice notes, and real-time messaging.',
    illustration: <OnboardingSlide2SVG width={SCREEN_WIDTH * 0.75} height={220} />,
  },
  {
    id: '3',
    title: 'Find Your Vibe Nearby 📍',
    subtitle:
      'Discover matches tailored to your interests, distance, and authentic personal style.',
    illustration: <OnboardingSlide3SVG width={SCREEN_WIDTH * 0.75} height={220} />,
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    if (slideIndex !== activeSlide && slideIndex >= 0 && slideIndex < ONBOARDING_SLIDES.length) {
      setActiveSlide(slideIndex);
    }
  };

  const handleNext = () => {
    if (activeSlide < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeSlide + 1,
        animated: true,
      });
    } else {
      markSeenAndComplete();
    }
  };

  const markSeenAndComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch (_) {}
    onComplete();
  }, [onComplete]);

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.illustrationContainer}>{item.illustration}</View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.subtitleText}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header Row with Skip button */}
        <View style={styles.headerRow}>
          <Text style={styles.brandLogoText}>ping</Text>
          {activeSlide < ONBOARDING_SLIDES.length - 1 ? (
            <TouchableOpacity activeOpacity={0.7} onPress={markSeenAndComplete}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />}
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
        />

        {/* Bottom Pagination & Controls */}
        <View style={styles.footerContainer}>
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

          <Button
            title={
              activeSlide === ONBOARDING_SLIDES.length - 1
                ? 'Get Started'
                : 'Next'
            }
            onPress={handleNext}
            style={styles.actionButton}
          />
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
  headerRow: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  brandLogoText: {
    ...Typography.heading,
    fontSize: 24,
    color: Colors.magenta,
    fontWeight: '800',
  },
  skipText: {
    ...Typography.bodyStrong,
    color: Colors.magenta,
    fontSize: 15,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  illustrationContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  titleText: {
    ...Typography.display,
    fontSize: 30,
    color: Colors.plum,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitleText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 320,
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 20,
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
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.magenta,
  },
  actionButton: {
    width: '100%',
  },
});
