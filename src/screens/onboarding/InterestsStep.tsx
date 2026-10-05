import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Chip, PillButton } from '../../ui';
import { interestsApi } from '../../api/interests';
import { unwrap } from '../../api/client';
import { MasterInterest } from '../../api/types';
import { StepLayout } from './StepLayout';

interface Props {
  step: number;
  total: number;
  /** Interest names the user already has (from GET /users/profile). */
  initialNames?: string[];
  onBack: () => void;
  onDone: (names: string[]) => void;
}

const MIN = 3;
const MAX = 10;

const EMOJI: [RegExp, string][] = [
  [/music|concert|guitar|sing/i, '🎵'],
  [/fit|gym|workout|run/i, '💪'],
  [/book|read/i, '📚'],
  [/coffee|cafe/i, '☕'],
  [/food|cook|eat|bak/i, '🍜'],
  [/travel|trip/i, '✈️'],
  [/hik|trek|nature|outdoor|camp/i, '🌿'],
  [/art|paint|draw|design/i, '🎨'],
  [/puzzle|game|chess/i, '🧩'],
  [/movie|film|cinema|netflix/i, '🎬'],
  [/photo/i, '📷'],
  [/yoga|meditat/i, '🧘'],
  [/dance/i, '💃'],
  [/pet|dog|cat/i, '🐾'],
  [/tech|code|startup/i, '💻'],
  [/sport|cricket|football|basket/i, '🏏'],
];
const emojiFor = (name: string) => EMOJI.find(([re]) => re.test(name))?.[1];

/** S5 — interest chips, min 3 (PUT /users/interests). */
export const InterestsStep: React.FC<Props> = ({ step, total, initialNames = [], onBack, onDone }) => {
  const catalogue = useQuery({
    queryKey: ['masterInterests'],
    queryFn: async () => unwrap(await interestsApi.getAllInterests()).interests,
    staleTime: 60 * 60 * 1000,
  });

  const [selected, setSelected] = useState<string[]>([]);

  // Pre-select what the user already saved once the catalogue arrives.
  useEffect(() => {
    if (catalogue.data && initialNames.length && selected.length === 0) {
      const lower = initialNames.map(n => n.toLowerCase());
      setSelected(catalogue.data.filter(i => lower.includes(i.name.toLowerCase())).map(i => i.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogue.data]);

  const grouped = useMemo(() => {
    const map = new Map<string, MasterInterest[]>();
    (catalogue.data ?? []).forEach(i => {
      const key = i.category || 'Other';
      map.set(key, [...(map.get(key) ?? []), i]);
    });
    return Array.from(map.entries());
  }, [catalogue.data]);

  const save = useMutation({
    mutationFn: async () => unwrap(await interestsApi.updateInterests({ interest_ids: selected })),
    onSuccess: data => onDone(data.interests),
  });

  const toggle = (id: string) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= MAX ? prev : [...prev, id]));

  let tint = 0;
  return (
    <StepLayout
      step={step}
      total={total}
      title="What are you into?"
      subtitle={`Pick at least ${MIN}. They show on your profile and help us find your people.`}
      onBack={onBack}
      onNext={() => save.mutate()}
      nextDisabled={selected.length < MIN}
      loading={save.isPending}
      error={save.error?.message}
    >
      <Text style={styles.counter}>
        {selected.length}/{MAX} selected{selected.length < MIN ? ` · ${MIN - selected.length} more to go` : ''}
      </Text>

      {catalogue.isLoading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : catalogue.isError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{(catalogue.error as Error).message}</Text>
          <PillButton title="Try again" variant="glass" onPress={() => catalogue.refetch()} />
        </View>
      ) : (
        grouped.map(([category, items]) => (
          <View key={category} style={styles.group}>
            <Text style={styles.category}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
            <View style={styles.chips}>
              {items.map(item => (
                <Chip
                  key={item.id}
                  label={item.name}
                  emoji={emojiFor(item.name)}
                  tintIndex={tint++}
                  selected={selected.includes(item.id)}
                  onPress={() => toggle(item.id)}
                />
              ))}
            </View>
          </View>
        ))
      )}
    </StepLayout>
  );
};

const styles = StyleSheet.create({
  counter: { ...Typography.label, color: Colors.primaryDeep, marginBottom: 14 },
  loader: { marginTop: 40 },
  group: { marginBottom: 18 },
  category: { ...Typography.label, color: Colors.mute, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  errorBox: { marginTop: 24, gap: 12 },
  errorText: { ...Typography.body, color: Colors.danger },
});
