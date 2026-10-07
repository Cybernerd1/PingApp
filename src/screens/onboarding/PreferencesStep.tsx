import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Chip, GlassCard, Stepper } from '../../ui';
import { preferencesApi } from '../../api/preferences';
import { privacyApi } from '../../api/privacy';
import { unwrap } from '../../api/client';
import { DatingPreferences, GenderType, PreferenceGenderType } from '../../api/types';
import { StepLayout } from './StepLayout';

interface Props {
  step: number;
  total: number;
  ownGender: GenderType | null;
  onBack: () => void;
  onDone: () => void;
}

const SHOW_ME: { value: PreferenceGenderType; label: string }[] = [
  { value: 'female', label: 'Women' },
  { value: 'male', label: 'Men' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'everyone', label: 'Everyone' },
];
const DISTANCES = [5, 10, 25, 50, 100, 20000]; // 20000 = no limit

function defaultShowMe(g: GenderType | null): PreferenceGenderType[] {
  if (g === 'female') return ['male'];
  if (g === 'male') return ['female'];
  return ['everyone'];
}

/** S7 — who to show in Discover. Also creates default privacy settings. */
export const PreferencesStep: React.FC<Props> = ({ step, total, ownGender, onBack, onDone }) => {
  const [showMe, setShowMe] = useState<PreferenceGenderType[]>(defaultShowMe(ownGender));
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(35);
  const [distance, setDistance] = useState(25);

  const toggle = (g: PreferenceGenderType) => {
    if (g === 'everyone') return setShowMe(['everyone']);
    setShowMe(prev => {
      const base = prev.filter(x => x !== 'everyone');
      const next = base.includes(g) ? base.filter(x => x !== g) : [...base, g];
      return next.length ? next : ['everyone'];
    });
  };

  const save = useMutation({
    mutationFn: async () => {
      const prefs: DatingPreferences = {
        interested_in: showMe,
        min_age: minAge,
        max_age: maxAge,
        max_distance_km: distance,
      };
      // PUT upserts on the backend (POST 409s if a row already exists).
      unwrap(await preferencesApi.updatePreferences(prefs));
      // Privacy defaults — editable later in Settings. Non-blocking.
      await privacyApi.updatePrivacySettings({
        show_distance: true,
        show_age: true,
        show_online_status: false,
        profile_visible_in_discover: true,
      });
    },
    onSuccess: onDone,
  });

  return (
    <StepLayout
      step={step}
      total={total}
      title="Who do you want to meet?"
      subtitle="You can fine-tune this anytime from the filter icon on Home."
      onBack={onBack}
      onNext={() => save.mutate()}
      nextLabel="Done"
      loading={save.isPending}
      error={save.error?.message}
    >
      <Text style={styles.section}>Show me</Text>
      <View style={styles.chips}>
        {SHOW_ME.map((o, i) => (
          <Chip key={o.value} label={o.label} tintIndex={i} selected={showMe.includes(o.value)} onPress={() => toggle(o.value)} />
        ))}
      </View>

      <Text style={styles.section}>Age range</Text>
      <GlassCard strong style={styles.card}>
        <View style={styles.rangeRow}>
          <Text style={styles.rangeLabel}>From</Text>
          <View style={styles.flex}>
            <Stepper label="Minimum age" value={minAge} min={18} max={maxAge} onChange={setMinAge} />
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.rangeRow}>
          <Text style={styles.rangeLabel}>To</Text>
          <View style={styles.flex}>
            <Stepper label="Maximum age" value={maxAge} min={minAge} max={100} onChange={setMaxAge} />
          </View>
        </View>
      </GlassCard>

      <Text style={styles.section}>Maximum distance</Text>
      <View style={styles.chips}>
        {DISTANCES.map((d, i) => (
          <Chip key={d} label={d >= 20000 ? 'No limit' : `${d} km`} tintIndex={i + 2} selected={distance === d} onPress={() => setDistance(d)} />
        ))}
      </View>
    </StepLayout>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { ...Typography.label, color: Colors.ink, marginTop: 8, marginBottom: 10, marginLeft: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  card: { marginBottom: 18 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  rangeLabel: { ...Typography.bodyStrong, color: Colors.mute, width: 44 },
  divider: { height: 1, backgroundColor: Colors.line, marginVertical: 12 },
});
