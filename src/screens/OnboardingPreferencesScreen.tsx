import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Button } from '../components/Button';
import { usePreferences } from '../hooks/usePreferences';
import { PreferenceGenderType } from '../api/types';

interface OnboardingPreferencesScreenProps {
  onNext: () => void;
}

export const OnboardingPreferencesScreen: React.FC<OnboardingPreferencesScreenProps> = ({ onNext }) => {
  const [interestedIn, setInterestedIn] = useState<PreferenceGenderType[]>(['female']);
  const [minAge, setMinAge] = useState(21);
  const [maxAge, setMaxAge] = useState(30);
  const [maxDistance, setMaxDistance] = useState(25);

  const { savePreferences, isSavingPreferences } = usePreferences();

  const toggleGender = (g: PreferenceGenderType) => {
    if (interestedIn.includes(g)) {
      if (interestedIn.length > 1) setInterestedIn(interestedIn.filter(item => item !== g));
    } else {
      setInterestedIn([...interestedIn, g]);
    }
  };

  const handleSave = async () => {
    const res = await savePreferences({
      interested_in: interestedIn,
      min_age: minAge,
      max_age: maxAge,
      max_distance_km: maxDistance,
    });
    if (res.status === 'success') {
      onNext();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Who are you looking for?</Text>
      <Text style={styles.subtitle}>Step 4 of 6 — Discovery Preferences</Text>

      <Text style={styles.label}>Interested In</Text>
      <View style={styles.chipRow}>
        {(['female', 'male', 'everyone'] as PreferenceGenderType[]).map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, interestedIn.includes(g) && styles.activeChip]}
            onPress={() => toggleGender(g)}
          >
            <Text style={[styles.chipText, interestedIn.includes(g) && styles.activeChipText]}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Age Range: {minAge} - {maxAge}</Text>
      <View style={styles.ageButtons}>
        <Button title="- Age" variant="secondary" onPress={() => setMinAge(Math.max(18, minAge - 1))} style={styles.flex1} />
        <Button title="+ Age" variant="secondary" onPress={() => setMaxAge(Math.min(60, maxAge + 1))} style={styles.flex1} />
      </View>

      <Text style={styles.label}>Maximum Distance: {maxDistance} km</Text>

      <Button title="Continue to Privacy" onPress={handleSave} loading={isSavingPreferences} style={styles.btn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 24 },
  title: { ...Typography.display, color: Colors.magenta, marginBottom: 4 },
  subtitle: { ...Typography.caption, color: Colors.plum, marginBottom: 24 },
  label: { ...Typography.caption, color: Colors.plum, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  chip: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  activeChip: { backgroundColor: Colors.magenta, borderColor: Colors.magenta },
  chipText: { ...Typography.bodyStrong, color: Colors.plum },
  activeChipText: { color: Colors.white },
  ageButtons: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  flex1: { flex: 1 },
  btn: { marginTop: 24 },
});
