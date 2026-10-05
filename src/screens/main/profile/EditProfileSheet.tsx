import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Radius, Typography } from '../../../theme/typography';
import { Chip, FieldRow, PillButton, Sheet } from '../../../ui';
import { profileApi } from '../../../api/profile';
import { GenderType, UserProfile } from '../../../api/types';
import { ageFromIso, dobToIso, MIN_AGE } from '../../onboarding/BasicsStep';

const GENDERS: { value: GenderType; label: string }[] = [
  { value: 'female', label: 'Woman' },
  { value: 'male', label: 'Man' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

/** PUT /users/profile — name, bio, gender, birthdate (non-sensitive fields only). */
export const EditProfileSheet: React.FC<{ visible: boolean; me: UserProfile; onClose: () => void; onSaved: () => void }> = ({
  visible,
  me,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<GenderType | null>(null);
  const [dob, setDob] = useState({ day: '', month: '', year: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(me.full_name ?? '');
    setBio(me.bio ?? '');
    setGender(me.gender ?? null);
    const [y = '', m = '', d = ''] = (me.birthdate ?? '').slice(0, 10).split('-');
    setDob({ day: d, month: m, year: y });
    setError(null);
  }, [visible, me]);

  const iso = dobToIso(dob);
  const age = iso ? ageFromIso(iso) : null;
  const dobError = !iso ? 'Enter a valid date' : age! < MIN_AGE ? `You must be at least ${MIN_AGE}` : null;
  const valid = name.trim().length >= 2 && !!gender && !dobError;

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    const res = await profileApi.updateProfile({ full_name: name.trim(), bio: bio.trim(), gender: gender!, birthdate: iso! });
    setSaving(false);
    if (res.status === 'error') return setError(res.details ? String(res.details) : res.message);
    onSaved();
    onClose();
  };

  const digits = (v: string) => v.replace(/[^0-9]/g, '');

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Edit profile"
      tall
      footer={
        <>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <PillButton title="Save" onPress={save} loading={saving} disabled={!valid} />
        </>
      }
    >
      <FieldRow label="Full Name" value={name} onChangeText={setName} maxLength={60} autoCapitalize="words" />
      <Text style={styles.label}>Date of Birth</Text>
      <View style={styles.dobRow}>
        {(['day', 'month', 'year'] as const).map(k => (
          <TextInput
            key={k}
            style={[styles.dob, k === 'year' && styles.dobYear]}
            value={dob[k]}
            onChangeText={v => setDob({ ...dob, [k]: digits(v) })}
            placeholder={k === 'day' ? 'DD' : k === 'month' ? 'MM' : 'YYYY'}
            placeholderTextColor={Colors.faint}
            keyboardType="number-pad"
            maxLength={k === 'year' ? 4 : 2}
            accessibilityLabel={`Birth ${k}`}
          />
        ))}
        {age !== null && !dobError ? <Text style={styles.age}>{age} yrs</Text> : null}
      </View>
      {dobError ? <Text style={styles.err}>{dobError}</Text> : null}

      <Text style={styles.label}>Gender</Text>
      <View style={styles.chips}>
        {GENDERS.map((g, i) => (
          <Chip key={g.value} label={g.label} tintIndex={i} selected={gender === g.value} onPress={() => setGender(g.value)} />
        ))}
      </View>

      <FieldRow
        label="Bio"
        value={bio}
        onChangeText={v => setBio(v.slice(0, 300))}
        multiline
        style={styles.bio}
        placeholder="Explorer at heart, foodie by passion…"
        hint={`${bio.length}/300`}
      />
    </Sheet>
  );
};

const styles = StyleSheet.create({
  label: { ...Typography.label, color: Colors.ink, marginBottom: 8, marginLeft: 4, marginTop: 4 },
  dobRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  dob: {
    width: 64,
    height: 52,
    borderRadius: Radius.small,
    backgroundColor: Colors.white,
    textAlign: 'center',
    ...Typography.bodyStrong,
    color: Colors.ink,
  },
  dobYear: { width: 88 },
  age: { ...Typography.label, color: Colors.primaryDeep, marginLeft: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  bio: { minHeight: 90, textAlignVertical: 'top' },
  err: { ...Typography.label, color: Colors.danger, marginBottom: 8 },
});
