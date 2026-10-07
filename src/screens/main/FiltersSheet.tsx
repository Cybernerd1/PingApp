import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Chip, GlassCard, PillButton, Sheet, Stepper } from '../../ui';
import { preferencesApi } from '../../api/preferences';
import { unwrap } from '../../api/client';
import { DatingPreferences, PreferenceGenderType } from '../../api/types';

const SHOW_ME: { value: PreferenceGenderType; label: string }[] = [
  { value: 'female', label: 'Women' },
  { value: 'male', label: 'Men' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'everyone', label: 'Everyone' },
];
/** Sentinel meaning "no distance limit" (backend treats >= 20000 as unlimited). */
export const NO_DISTANCE_LIMIT = 20000;
const DISTANCES = [5, 10, 25, 50, 100, NO_DISTANCE_LIMIT];

export const PREFS_KEY = ['preferences'];

/** S11 — Discover filters (GET/PUT /users/preferences). */
export const FiltersSheet: React.FC<{ visible: boolean; onClose: () => void; onSaved: () => void }> = ({
  visible,
  onClose,
  onSaved,
}) => {
  const qc = useQueryClient();
  const prefsQ = useQuery({
    queryKey: PREFS_KEY,
    queryFn: async () => unwrap(await preferencesApi.getPreferences()),
    enabled: visible,
  });
  const [draft, setDraft] = useState<DatingPreferences | null>(null);

  useEffect(() => {
    if (visible && prefsQ.data) setDraft(prefsQ.data);
  }, [visible, prefsQ.data]);

  const save = useMutation({
    mutationFn: async (p: DatingPreferences) => unwrap(await preferencesApi.updatePreferences(p)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PREFS_KEY });
      onSaved();
      onClose();
    },
  });

  const toggle = (g: PreferenceGenderType) => {
    if (!draft) return;
    if (g === 'everyone') return setDraft({ ...draft, interested_in: ['everyone'] });
    const base = draft.interested_in.filter(x => x !== 'everyone');
    const next = base.includes(g) ? base.filter(x => x !== g) : [...base, g];
    setDraft({ ...draft, interested_in: next.length ? next : ['everyone'] });
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Discovery filters"
      footer={
        <>
          {save.error ? <Text style={styles.err}>{(save.error as Error).message}</Text> : null}
          <PillButton title="Apply" onPress={() => draft && save.mutate(draft)} loading={save.isPending} disabled={!draft} />
        </>
      }
    >
      {!draft ? (
        prefsQ.isError ? (
          <Text style={styles.err}>{(prefsQ.error as Error).message}</Text>
        ) : (
          <ActivityIndicator color={Colors.primary} style={styles.loader} />
        )
      ) : (
        <>
          <Text style={styles.section}>Show me</Text>
          <View style={styles.chips}>
            {SHOW_ME.map((o, i) => (
              <Chip key={o.value} label={o.label} tintIndex={i} selected={draft.interested_in.includes(o.value)} onPress={() => toggle(o.value)} />
            ))}
          </View>

          <Text style={styles.section}>Age range</Text>
          <GlassCard strong style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>From</Text>
              <View style={styles.flex}>
                <Stepper label="Minimum age" value={draft.min_age} min={18} max={draft.max_age} onChange={v => setDraft({ ...draft, min_age: v })} />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>To</Text>
              <View style={styles.flex}>
                <Stepper label="Maximum age" value={draft.max_age} min={draft.min_age} max={100} onChange={v => setDraft({ ...draft, max_age: v })} />
              </View>
            </View>
          </GlassCard>

          <Text style={styles.section}>Maximum distance</Text>
          <View style={styles.chips}>
            {DISTANCES.map((d, i) => (
              <Chip key={d} label={d >= NO_DISTANCE_LIMIT ? 'No limit' : `${d} km`} tintIndex={i + 2} selected={draft.max_distance_km === d} onPress={() => setDraft({ ...draft, max_distance_km: d })} />
            ))}
          </View>
        </>
      )}
    </Sheet>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loader: { marginVertical: 40 },
  section: { ...Typography.label, color: Colors.ink, marginTop: 6, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  card: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  rowLabel: { ...Typography.bodyStrong, color: Colors.mute, width: 44 },
  divider: { height: 1, backgroundColor: Colors.line, marginVertical: 12 },
  err: { ...Typography.label, color: Colors.danger, marginBottom: 8 },
});
