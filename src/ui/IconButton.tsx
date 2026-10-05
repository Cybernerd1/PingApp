import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { Shadow } from '../theme/typography';

interface IconButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  size?: number;
  variant?: 'glass' | 'dark' | 'primary' | 'white';
  badge?: number;
  disabled?: boolean;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

const BG = { glass: Colors.glassStrong, dark: Colors.ink, primary: Colors.primary, white: Colors.white };

/** Round icon button (filter, bell, back, swipe actions). */
export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  children,
  size = 44,
  variant = 'glass',
  badge,
  disabled,
  accessibilityLabel,
  style,
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
    disabled={disabled}
    hitSlop={6}
    style={({ pressed }) => [
      styles.base,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: BG[variant] },
      variant !== 'glass' ? Shadow.soft : null,
      pressed && styles.pressed,
      disabled && styles.disabled,
      style,
    ]}
  >
    {children}
    {badge ? (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
      </View>
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.92 }] },
  disabled: { opacity: 0.4 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
});
