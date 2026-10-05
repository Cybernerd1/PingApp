import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Shadow, Typography } from '../theme/typography';

export type PillVariant = 'dark' | 'primary' | 'glass' | 'ghost';

interface PillButtonProps {
  title: string;
  onPress: () => void;
  variant?: PillVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  /** Round "Next" button from the reference (circle, label inside). */
  round?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

const BG: Record<PillVariant, string> = {
  dark: Colors.ink,
  primary: Colors.primary,
  glass: Colors.glassStrong,
  ghost: 'transparent',
};
const FG: Record<PillVariant, string> = {
  dark: Colors.white,
  primary: Colors.white,
  glass: Colors.ink,
  ghost: Colors.ink,
};

/**
 * Black / purple pill CTA ("Join Now", "Sign Up", "Set Up Preferences")
 * and the round black "Next" button used through onboarding.
 */
export const PillButton: React.FC<PillButtonProps> = ({
  title,
  onPress,
  variant = 'dark',
  disabled,
  loading,
  icon,
  round,
  size = 76,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const isOff = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!isOff, busy: !!loading }}
      onPress={onPress}
      disabled={isOff}
      style={({ pressed }) => [
        styles.base,
        round ? { width: size, height: size, borderRadius: size / 2, paddingHorizontal: 0 } : null,
        { backgroundColor: BG[variant] },
        variant === 'primary' ? Shadow.glow : variant === 'dark' ? Shadow.lifted : null,
        variant === 'glass' ? styles.glassBorder : null,
        pressed && !isOff ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={FG[variant]} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.text, { color: FG[variant] }, textStyle]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: Radius.pill,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { ...Typography.bodyStrong, fontWeight: '700' },
  glassBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  disabled: { opacity: 0.4 },
});
