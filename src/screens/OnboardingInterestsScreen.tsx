import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Button } from '../components/Button';
import { useInterests } from '../hooks/useInterests';

interface OnboardingInterestsScreenProps {
  onNext: () => void;
}

const DEFAULT_INTERESTS = [
  { id: '1', name: 'Hiking' },
  { id: '2', name: 'Coffee' },
  { id: '3', name: 'Live Music' },
  { id: '4', name: 'Photography' },
  { id: '5', name: 'Cooking' },
  { id: '6', name: 'Board Games' },
  { id: '7', name: 'Yoga' },
  { id: '8', name: 'Travel' },
];

export const OnboardingInterestsScreen: React.FC<OnboardingInterestsScreenProps> = ({ onNext }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { allInterests, saveInterests, isSavingInterests } = useInterests();

  const interestsList = allInterests.length > 0 ? allInterests : DEFAULT_INTERESTS;

  const toggleInterest = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSave = async () => {
    if (selectedIds.length < 3) return;
    const res = await saveInterests({ interest_ids: selectedIds });
    if (res.status === 'success') {
      onNext();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>What do you love?</Text>
      <Text style={styles.subtitle}>Step 2 of 6 — Select at least 3 interests</Text>

      <View style={styles.tagGrid}>
        {interestsList.map(item => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.tag, isSelected && styles.activeTag]}
              onPress={() => toggleInterest(item.id)}
            >
              <Text style={[styles.tagText, isSelected && styles.activeTagText]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        title={`Continue (${selectedIds.length}/3 minimum)`}
        onPress={handleSave}
        loading={isSavingInterests}
        disabled={selectedIds.length < 3}
        style={styles.btn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 24 },
  title: { ...Typography.display, color: Colors.magenta, marginBottom: 4 },
  subtitle: { ...Typography.caption, color: Colors.plum, marginBottom: 24 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  tag: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.blush, borderWidth: 1.5, borderColor: Colors.borderLight },
  activeTag: { backgroundColor: Colors.magenta, borderColor: Colors.magenta },
  tagText: { ...Typography.bodyStrong, color: Colors.magenta, fontSize: 14 },
  activeTagText: { color: Colors.white },
  btn: { marginTop: 16 },
});
