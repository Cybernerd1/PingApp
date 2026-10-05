import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Chip, PillButton, Sheet } from '../../../ui';
import { interestsApi } from '../../../api/interests';
import { unwrap } from '../../../api/client';

const MIN = 3;
const MAX = 10;

/** GET /interests + PUT /users/interests. */
export const InterestsSheet: React.FC<{ visible: boolean; current: string[]; onClose: () => void; onSaved: () => void }> = ({
  visible,
  current,
  onClose,
  onSaved,
}) => {
  const catalogue = useQuery({
    queryKey: ['masterInterests'],
    queryFn: async () => unwrap(await interestsApi.getAllInterests()).interests,
    staleTime: 60 * 60_000,
    enabled: visible,
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && catalogue.data) {
      const lower = current.map(c => c.toLowerCase());
      setSelected(catalogue.data.filter(i => lower.includes(i.name.toLowerCase())).map(i => i.id));
    }
  }, [visible, catalogue.data, current]);

  const toggle = (id: string) =>
    setSelected(p => (p.includes(id) ? p.filter(x => x !== id) : p.length >= MAX ? p : [...p, id]));

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await interestsApi.updateInterests({ interest_ids: selected });
    setSaving(false);
    if (res.status === 'error') return setError(res.message);
    onSaved();
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Interests"
      tall
      footer={
        <>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <PillButton title={`Save (${selected.length}/${MAX})`} onPress={save} loading={saving} disabled={selected.length < MIN} />
        </>
      }
    >
      <Text style={styles.hint}>Pick {MIN}–{MAX}. They show on your profile.</Text>
      {catalogue.isLoading ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : catalogue.isError ? (
        <Text style={styles.err}>{(catalogue.error as Error).message}</Text>
      ) : (
        <View style={styles.chips}>
          {(catalogue.data ?? []).map((i, idx) => (
            <Chip key={i.id} label={i.name} tintIndex={idx} selected={selected.includes(i.id)} onPress={() => toggle(i.id)} />
          ))}
        </View>
      )}
    </Sheet>
  );
};

const styles = StyleSheet.create({
  hint: { ...Typography.caption, color: Colors.mute, marginBottom: 12 },
  loader: { marginVertical: 40 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  err: { ...Typography.label, color: Colors.danger, marginBottom: 8 },
});
