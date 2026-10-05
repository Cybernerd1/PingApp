import React, { useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radius, Typography } from '../../theme/typography';
import { Check, Crosshair, FieldRow } from '../../ui';
import { LocationCoordinates } from '../../api/types';
import { StepLayout } from './StepLayout';

export interface DobParts {
  day: string;
  month: string;
  year: string;
}

interface Props {
  step: number;
  total: number;
  fullName: string;
  onFullName: (v: string) => void;
  email?: string | null;
  dob: DobParts;
  onDob: (v: DobParts) => void;
  bio: string;
  onBio: (v: string) => void;
  coords: LocationCoordinates | null;
  locating: boolean;
  locationError?: string | null;
  onLocate: () => void;
  onBack: () => void;
  onNext: () => void;
  saving: boolean;
  error?: string | null;
}

export const MIN_AGE = 18;
const BIO_MAX = 300;

/** Returns ISO yyyy-mm-dd or null if the parts don't form a real date. */
export function dobToIso({ day, month, year }: DobParts): string | null {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!d || !m || year.length !== 4) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function ageFromIso(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age;
}

/** S4 — Full name / Email / Date of birth (→ age) / Bio / Location. */
export const BasicsStep: React.FC<Props> = props => {
  const { dob, onDob } = props;
  const monthRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const yearRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  const iso = dobToIso(dob);
  const age = iso ? ageFromIso(iso) : null;
  const dobComplete = dob.day.length > 0 && dob.month.length > 0 && dob.year.length === 4;
  const dobError = dobComplete && !iso
    ? 'That date doesn’t look right'
    : age !== null && age < MIN_AGE
      ? `You must be at least ${MIN_AGE} to use Ping`
      : age !== null && age > 100
        ? 'Please check the year'
        : undefined;

  const nameOk = props.fullName.trim().length >= 2;
  const canContinue = nameOk && !!iso && !dobError;

  const digits = (v: string) => v.replace(/[^0-9]/g, '');

  return (
    <StepLayout
      step={props.step}
      total={props.total}
      title="Tell us about you"
      subtitle="Only your first name and age are shown on your profile."
      onBack={props.onBack}
      onNext={props.onNext}
      nextDisabled={!canContinue}
      loading={props.saving}
      error={props.error}
    >
      <FieldRow
        label="Full Name"
        placeholder="Enter name"
        value={props.fullName}
        onChangeText={props.onFullName}
        autoCapitalize="words"
        autoComplete="name"
        returnKeyType="next"
        maxLength={60}
      />

      {props.email ? (
        <FieldRow
          label="Email Address"
          value={props.email}
          readOnly
          hint="This email will not be visible to others."
        />
      ) : null}

      <Text style={styles.label}>Date of Birth</Text>
      <View style={[styles.dobBox, !!dobError && styles.dobBoxError]}>
        <TextInput
          style={[styles.dobInput, styles.dd]}
          placeholder="DD"
          placeholderTextColor={Colors.faint}
          keyboardType="number-pad"
          maxLength={2}
          value={dob.day}
          accessibilityLabel="Day of birth"
          onChangeText={v => {
            const day = digits(v);
            onDob({ ...dob, day });
            if (day.length === 2) monthRef.current?.focus();
          }}
        />
        <Text style={styles.slash}>/</Text>
        <TextInput
          ref={monthRef}
          style={[styles.dobInput, styles.dd]}
          placeholder="MM"
          placeholderTextColor={Colors.faint}
          keyboardType="number-pad"
          maxLength={2}
          value={dob.month}
          accessibilityLabel="Month of birth"
          onChangeText={v => {
            const month = digits(v);
            onDob({ ...dob, month });
            if (month.length === 2) yearRef.current?.focus();
          }}
        />
        <Text style={styles.slash}>/</Text>
        <TextInput
          ref={yearRef}
          style={[styles.dobInput, styles.yyyy]}
          placeholder="YYYY"
          placeholderTextColor={Colors.faint}
          keyboardType="number-pad"
          maxLength={4}
          value={dob.year}
          accessibilityLabel="Year of birth"
          onChangeText={v => onDob({ ...dob, year: digits(v) })}
        />
        <View style={styles.flex} />
        {age !== null && !dobError ? (
          <View style={styles.ageBadge}>
            <Text style={styles.ageText}>{age}</Text>
          </View>
        ) : null}
      </View>
      <Text style={dobError ? styles.err : styles.hint}>{dobError ?? 'Your age is shown, never your birthday.'}</Text>

      <Text style={[styles.label, styles.mt]}>Location</Text>
      <Pressable
        accessibilityRole="button"
        onPress={props.onLocate}
        disabled={props.locating}
        style={({ pressed }) => [styles.locRow, pressed && styles.pressed]}
      >
        <View style={styles.locIcon}>
          {props.locating ? <ActivityIndicator color={Colors.ink} size="small" /> : <Crosshair />}
        </View>
        <Text style={[styles.locText, !props.coords && styles.locPlaceholder]}>
          {props.coords ? 'Current location set' : 'Your location'}
        </Text>
        {props.coords ? (
          <View style={styles.locCheck}>
            <Check size={12} />
          </View>
        ) : null}
      </Pressable>
      <Text style={props.locationError ? styles.err : styles.hint}>
        {props.locationError ?? 'Needed to show people near you. Only distance is shared.'}
      </Text>

      <View style={styles.mt}>
        <FieldRow
          label="Bio (optional)"
          placeholder="Explorer at heart, foodie by passion…"
          value={props.bio}
          onChangeText={v => props.onBio(v.slice(0, BIO_MAX))}
          multiline
          style={styles.bio}
          hint={`${props.bio.length}/${BIO_MAX}`}
        />
      </View>
    </StepLayout>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mt: { marginTop: 18 },
  label: { ...Typography.label, color: Colors.ink, marginBottom: 8, marginLeft: 4 },
  dobBox: {
    height: 56,
    borderRadius: Radius.card,
    backgroundColor: Colors.glassStrong,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dobBoxError: { borderColor: Colors.danger },
  dobInput: { ...Typography.bodyStrong, color: Colors.ink, textAlign: 'center', paddingVertical: 0 },
  dd: { width: 36 },
  yyyy: { width: 56 },
  slash: { ...Typography.bodyStrong, color: Colors.faint, marginHorizontal: 2 },
  ageBadge: {
    minWidth: 40,
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 10,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageText: { ...Typography.bodyStrong, color: Colors.white },
  hint: { ...Typography.caption, color: Colors.mute, marginTop: 6, marginLeft: 4 },
  err: { ...Typography.caption, color: Colors.danger, marginTop: 6, marginLeft: 4 },
  locRow: {
    height: 60,
    borderRadius: Radius.card,
    backgroundColor: Colors.glassStrong,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 12,
  },
  pressed: { opacity: 0.85 },
  locIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locText: { ...Typography.bodyStrong, color: Colors.ink, flex: 1 },
  locPlaceholder: { color: Colors.mute, fontWeight: '500' },
  locCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.online,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  bio: { minHeight: 90, textAlignVertical: 'top' },
});
