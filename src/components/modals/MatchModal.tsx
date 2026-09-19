import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, Modal, Dimensions, Vibration } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { PressableScale } from '../common/PressableScale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface MatchModalProps {
  visible: boolean;
  userAvatar?: string;
  matchAvatar?: string;
  matchName?: string;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  matchAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  matchName = 'Alex',
  onSendMessage,
  onKeepSwiping,
}) => {
  const overlayOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0);

  // Avatars bounce in from opposite sides
  const avatarLeftX = useSharedValue(-160);
  const avatarRightX = useSharedValue(160);
  const avatarScale = useSharedValue(0);

  // Celebration heart / confetti burst
  const burstScale = useSharedValue(0);

  // Buttons fade/slide in after celebration beat finishes
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(40);

  useEffect(() => {
    if (visible) {
      // 1. Double-pulse haptic vibration on mount
      try {
        Vibration.vibrate([0, 30, 40, 30]);
      } catch (_) {}

      // 2. Overlay Fade In
      overlayOpacity.value = withTiming(1, { duration: 300 });

      // 3. Title Bounce
      titleScale.value = withSpring(1, { damping: 12, stiffness: 200 });

      // 4. Avatars Bounce In from opposite sides (Left & Right)
      avatarLeftX.value = withSpring(0, { damping: 11, stiffness: 140 });
      avatarRightX.value = withSpring(0, { damping: 11, stiffness: 140 });
      avatarScale.value = withSpring(1, { damping: 10, stiffness: 160 });

      // 5. Celebration burst timed to avatars settling
      burstScale.value = withDelay(
        350,
        withSequence(
          withSpring(1.3, { damping: 8, stiffness: 220 }),
          withSpring(1, { damping: 12, stiffness: 180 })
        )
      );

      // 6. Action buttons fade/slide in AFTER celebration beat finishes (~750ms delay)
      buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
      buttonsTranslateY.value = withDelay(
        800,
        withSpring(0, { damping: 14, stiffness: 160 })
      );
    } else {
      // Reset values
      overlayOpacity.value = 0;
      titleScale.value = 0;
      avatarLeftX.value = -160;
      avatarRightX.value = 160;
      avatarScale.value = 0;
      burstScale.value = 0;
      buttonsOpacity.value = 0;
      buttonsTranslateY.value = 40;
    }
  }, [visible]);

  const animatedOverlay = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const animatedTitle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const animatedLeftAvatar = useAnimatedStyle(() => ({
    transform: [
      { translateX: avatarLeftX.value },
      { scale: avatarScale.value },
    ],
  }));

  const animatedRightAvatar = useAnimatedStyle(() => ({
    transform: [
      { translateX: avatarRightX.value },
      { scale: avatarScale.value },
    ],
  }));

  const animatedBurst = useAnimatedStyle(() => ({
    transform: [{ scale: burstScale.value }],
  }));

  const animatedButtons = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, animatedOverlay]}>
        {/* Background Radiant Glow */}
        <View style={styles.glowCircle} />

        {/* Title */}
        <Animated.View style={[styles.titleContainer, animatedTitle]}>
          <Text style={styles.matchTitle}>It's a Match!</Text>
          <Text style={styles.matchSubtitle}>You and {matchName} liked each other</Text>
        </Animated.View>

        {/* Avatars Container */}
        <View style={styles.avatarsWrapper}>
          <Animated.View style={[styles.avatarFrame, styles.leftAvatarFrame, animatedLeftAvatar]}>
            <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
          </Animated.View>

          {/* Celebration Heart Burst Badge */}
          <Animated.View style={[styles.heartBadge, animatedBurst]}>
            <Text style={styles.heartIcon}>💖</Text>
          </Animated.View>

          <Animated.View style={[styles.avatarFrame, styles.rightAvatarFrame, animatedRightAvatar]}>
            <Image source={{ uri: matchAvatar }} style={styles.avatarImage} />
          </Animated.View>
        </View>

        {/* Action Buttons (Appears AFTER celebration beat) */}
        <Animated.View style={[styles.buttonsContainer, animatedButtons]}>
          <PressableScale style={styles.primaryButton} onPress={onSendMessage}>
            <Text style={styles.primaryButtonText}>Send a Message</Text>
          </PressableScale>

          <PressableScale style={styles.secondaryButton} onPress={onKeepSwiping}>
            <Text style={styles.secondaryButtonText}>Keep Swiping</Text>
          </PressableScale>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(43, 22, 32, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  glowCircle: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: SCREEN_WIDTH * 0.6,
    backgroundColor: 'rgba(232, 68, 122, 0.2)',
    top: '20%',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  matchTitle: {
    ...Typography.heading,
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: Colors.magenta,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    textAlign: 'center',
  },
  matchSubtitle: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.blush,
    marginTop: 8,
    textAlign: 'center',
  },
  avatarsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    width: '100%',
  },
  avatarFrame: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  leftAvatarFrame: {
    marginRight: -15,
  },
  rightAvatarFrame: {
    marginLeft: -15,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  heartBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: Colors.magenta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  heartIcon: {
    fontSize: 24,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    backgroundColor: Colors.magenta,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.magenta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    width: '100%',
    height: 54,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 27,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
