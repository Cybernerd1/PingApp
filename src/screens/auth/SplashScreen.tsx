import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors } from '../../theme/colors';

const PING_ICON = require('../../assets/images/ping_icon.png');
const PING_LOGO_FULL = require('../../assets/images/ping_logo_full.png');

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
    ]).start(() => onComplete());
    // Runs once on mount; Animated.Value refs are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Decorative blobs */}
      <View style={[styles.blob, styles.blobTopRight]} />
      <View style={[styles.blob, styles.blobBottomLeft]} />


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
  logoContainer: {
    marginBottom: 16,
  },
  logoBox: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 88,
    height: 88,
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
