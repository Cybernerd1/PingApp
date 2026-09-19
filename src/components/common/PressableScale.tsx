import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  // Graceful fallback if expo-haptics is not available
}

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  enableHaptics?: boolean;
  children: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  style,
  scaleTo = 0.96,
  enableHaptics = true,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (event: any) => {
    if (disabled) return;
    scale.value = withSpring(scaleTo, {
      damping: 15,
      stiffness: 300,
      mass: 0.5,
    });

    if (enableHaptics && Haptics?.impactAsync) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }

    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    if (disabled) return;
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
      mass: 0.5,
    });
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
};
