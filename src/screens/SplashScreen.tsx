import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { Colors } from '../theme/colors';

const PING_ICON = require('../assets/images/ping_icon.png');
const PING_LOGO_FULL = require('../assets/images/ping_logo_full.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const rippleScale1 = useRef(new Animated.Value(0)).current;
  const rippleOpacity1 = useRef(new Animated.Value(0.6)).current;
  const rippleScale2 = useRef(new Animated.Value(0)).current;
  const rippleOpacity2 = useRef(new Animated.Value(0.4)).current;
  const rippleScale3 = useRef(new Animated.Value(0)).current;
  const rippleOpacity3 = useRef(new Animated.Value(0.2)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Ripple animations
    const rippleAnimation = Animated.loop(
      Animated.stagger(600, [
        Animated.parallel([
          Animated.timing(rippleScale1, {
            toValue: 3,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity1, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(rippleScale2, {
            toValue: 3,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity2, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(rippleScale3, {
            toValue: 3,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity3, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Main sequence
    Animated.sequence([
      // Logo pops in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          damping: 12,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // App name fades in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
      // Subtitle fades in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Hold
      Animated.delay(800),
      // Fade out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rippleAnimation.stop();
      onComplete();
    });

    rippleAnimation.start();

    return () => {
      rippleAnimation.stop();
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Decorative blobs */}
      <View style={[styles.blob, styles.blobTopRight]} />
      <View style={[styles.blob, styles.blobBottomLeft]} />

      {/* Ripple rings */}
      <Animated.View
        style={[
          styles.ripple,
          {
            transform: [{ scale: rippleScale1 }],
            opacity: rippleOpacity1,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ripple,
          {
            transform: [{ scale: rippleScale2 }],
            opacity: rippleOpacity2,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ripple,
          {
            transform: [{ scale: rippleScale3 }],
            opacity: rippleOpacity3,
          },
        ]}
      />

      {/* Logo Mark — real ping_icon.png */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logoBox}>
          <Image
            source={PING_ICON}
            style={styles.logoIcon}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* App Name — real ping_logo_full.png */}
      <Animated.View style={{ opacity: textOpacity }}>
        <Image
          source={PING_LOGO_FULL}
          style={styles.logoFullImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: subtitleOpacity }]}>
        Chat. Connect. Be Real.
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.25,
  },
  blobTopRight: {
    top: -60,
    right: -60,
    backgroundColor: Colors.coral,
  },
  blobBottomLeft: {
    bottom: -80,
    left: -80,
    backgroundColor: Colors.peach,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.magenta,
    opacity: 0.3,
  },
  logoContainer: {
    marginBottom: 16,
    shadowColor: Colors.magenta,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: Colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoIcon: {
    width: 60,
    height: 60,
  },
  logoFullImage: {
    width: 160,
    height: 48,
    marginBottom: 8,
    marginTop: 4,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
});
