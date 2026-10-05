import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useProfile } from '../hooks/useProfile';
import { GenderType } from '../api/types';

interface OnboardingProfileScreenProps {
  onNext: () => void;
}

export const OnboardingProfileScreen: React.FC<OnboardingProfileScreenProps> = ({ onNext }) => {
  const [fullName, setFullName] = useState('');
  const [birthdate, setBirthdate] = useState('2000-01-01');
  const [gender, setGender] = useState<GenderType>('female');
  const [bio, setBio] = useState('');
  const { createProfile, isCreatingProfile } = useProfile();

  const handleCreate = async () => {
    if (!fullName.trim()) return;
    const res = await createProfile({
      full_name: fullName.trim(),
      email: 'user@example.com',
      phone: '+1234567890',
      birthdate,
      gender,
      bio,
    });
    if (res.status === 'success') {
      onNext();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tell us about yourself</Text>
      <Text style={styles.subtitle}>Step 1 of 6 — Basic Info</Text>

      <Input label="Full Name" placeholder="Riya Sharma" value={fullName} onChangeText={setFullName} />
      <Input label="Birthdate (YYYY-MM-DD)" placeholder="2001-04-12" value={birthdate} onChangeText={setBirthdate} />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderRow}>
        {(['female', 'male', 'other'] as GenderType[]).map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.genderChip, gender === g && styles.activeGenderChip]}
            onPress={() => setGender(g)}
          >
            <Text style={[styles.genderText, gender === g && styles.activeGenderText]}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input label="Bio" placeholder="Say something friendly..." value={bio} onChangeText={setBio} multiline numberOfLines={3} />

      <Button title="Continue to Interests" onPress={handleCreate} loading={isCreatingProfile} disabled={!fullName.trim()} style={styles.btn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 24 },
  title: { ...Typography.display, color: Colors.magenta, marginBottom: 4 },
  subtitle: { ...Typography.caption, color: Colors.plum, marginBottom: 24 },
  label: { ...Typography.caption, color: Colors.plum, fontWeight: '600', marginBottom: 8 },
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  genderChip: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  activeGenderChip: { backgroundColor: Colors.magenta, borderColor: Colors.magenta },
  genderText: { ...Typography.bodyStrong, color: Colors.plum },
  activeGenderText: { color: Colors.white },
  btn: { marginTop: 16 },
});
