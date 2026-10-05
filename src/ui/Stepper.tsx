import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';
import { Minus, Plus } from './icons';

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  label?: string;
}

/** − value + control (the reference's "Age 18" row). */
export const Stepper: React.FC<StepperProps> = ({ value, onChange, min, max, step = 1, suffix, label }) => {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={e => (e.nativeEvent.actionName === 'increment' ? inc() : dec())}
    >
      <Pressable onPress={dec} disabled={value <= min} style={[styles.btn, value <= min && styles.off]} hitSlop={6}>
        <Minus />
      </Pressable>
      <Text style={styles.value}>
        {value}
        {suffix ? <Text style={styles.suffix}>{` ${suffix}`}</Text> : null}
      </Text>
      <Pressable onPress={inc} disabled={value >= max} style={[styles.btn, value >= max && styles.off]} hitSlop={6}>
        <Plus />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  btn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(18,16,22,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  off: { opacity: 0.35 },
  value: { ...Typography.heading, color: Colors.ink, minWidth: 70, textAlign: 'center' },
  suffix: { ...Typography.caption, color: Colors.mute },
});
