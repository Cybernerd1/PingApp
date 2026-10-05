import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radius, Shadow, Typography } from '../../theme/typography';
import { Check, Chip } from '../../ui';
import { Portrait, PortraitKind } from '../../components/illustrations/PeopleBubbles';
import { GenderType } from '../../api/types';
import { StepLayout } from './StepLayout';

interface Props {
  value: GenderType | null;
  onChange: (g: GenderType) => void;
  onNext: () => void;
  onSkip: () => void;
  step: number;
  total: number;
}

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 24 * 2 - 14) / 2;
const CARD_H = CARD_W * 1.45;

const MAIN: { value: GenderType; label: string; art: PortraitKind }[] = [
  { value: 'female', label: 'Woman', art: 'woman' },
  { value: 'male', label: 'Man', art: 'man' },
];
const MORE: { value: GenderType; label: string }[] = [
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
];

/** S3 — "Are you a…" with portrait cards and a round "Skip For Now". */
export const GenderStep: React.FC<Props> = ({ value, onChange, onNext, onSkip, step, total }) => (
  <StepLayout
    step={step}
    total={total}
    title="Are you a…"
    subtitle="This helps us show you to the right people. You can change it later."
    onNext={onNext}
    nextDisabled={!value}
    footerLeft={
      <Pressable accessibilityRole="button" onPress={onSkip} style={styles.skip}>
        <Text style={styles.skipText}>Skip For{'\n'}Now</Text>
      </Pressable>
    }
  >
    <View style={styles.cards}>
      {MAIN.map(opt => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [styles.card, selected && styles.cardOn, pressed && styles.pressed]}
          >
            <Portrait kind={opt.art} width={CARD_W} height={CARD_H} />
            <View style={[styles.label, selected && styles.labelOn]}>
              <Text style={[styles.labelText, selected && styles.labelTextOn]}>{opt.label}</Text>
            </View>
            {selected ? (
              <View style={styles.tick}>
                <Check />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>

    <Text style={styles.more}>More options</Text>
    <View style={styles.moreRow}>
      {MORE.map((opt, i) => (
        <Chip
          key={opt.value}
          label={opt.label}
          tintIndex={i + 4}
          selected={value === opt.value}
          onPress={() => onChange(opt.value)}
        />
      ))}
    </View>
  </StepLayout>
);

const styles = StyleSheet.create({
  cards: { flexDirection: 'row', gap: 14 },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: Radius.largeCard,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    ...Shadow.soft,
  },
  cardOn: { borderColor: Colors.ink },
  pressed: { transform: [{ scale: 0.98 }] },
  label: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  labelOn: { backgroundColor: Colors.primary },
  labelText: { ...Typography.bodyStrong, color: Colors.ink },
  labelTextOn: { color: Colors.white },
  tick: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  more: { ...Typography.label, color: Colors.mute, marginTop: 24, marginBottom: 10 },
  moreRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  skip: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.glassStrong,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  skipText: { ...Typography.caption, fontWeight: '600', color: Colors.ink, textAlign: 'center' },
});
