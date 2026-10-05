import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { ChevronRight } from './icons';

interface ListRowProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
  /** Renders a switch instead of a chevron. */
  toggle?: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean };
  right?: React.ReactNode;
  last?: boolean;
}

export const ListRow: React.FC<ListRowProps> = ({ title, subtitle, onPress, danger, toggle, right, last }) => (
  <Pressable
    accessibilityRole={toggle ? 'switch' : 'button'}
    accessibilityState={toggle ? { checked: toggle.value } : undefined}
    onPress={toggle ? () => toggle.onChange(!toggle.value) : onPress}
    disabled={!onPress && !toggle}
    style={({ pressed }) => [styles.row, !last && styles.border, pressed && styles.pressed]}
  >
    <View style={styles.flex}>
      <Text style={[styles.title, danger && styles.danger]}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
    {toggle ? (
      <Switch
        value={toggle.value}
        onValueChange={toggle.onChange}
        disabled={toggle.disabled}
        trackColor={{ true: Colors.primary, false: 'rgba(18,16,22,0.15)' }}
        thumbColor={Colors.white}
      />
    ) : right ?? (onPress ? <ChevronRight /> : null)}
  </Pressable>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  border: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  pressed: { opacity: 0.6 },
  flex: { flex: 1 },
  title: { ...Typography.bodyStrong, color: Colors.ink },
  danger: { color: Colors.danger },
  sub: { ...Typography.caption, color: Colors.mute, marginTop: 2 },
});
