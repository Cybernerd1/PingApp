import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography, Radius, Spacing } from '../theme/typography';
import { Button } from '../components/Button';
import apiClient from '../services/apiClient';

const { width: SW } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface SetupScreenProps {
  user: any;
  onComplete: (updatedUser: any) => void;
}

type GenderOption = 'man' | 'woman' | 'non-binary' | 'other' | 'prefer_not_to_say';

const GENDER_OPTIONS: { value: GenderOption; label: string; emoji: string }[] = [
  { value: 'man', label: 'Man', emoji: '👨' },
  { value: 'woman', label: 'Woman', emoji: '👩' },
  { value: 'non-binary', label: 'Non-binary', emoji: '🧑' },
  { value: 'other', label: 'Other', emoji: '✨' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', emoji: '🤐' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Drum-roll DOB Picker
// ─────────────────────────────────────────────────────────────────────────────
const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => String(currentYear - 18 - i));

interface DrumPickerProps {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  width?: number;
}

const DrumPicker: React.FC<DrumPickerProps> = ({ items, selectedIndex, onSelect, width = 100 }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [isReady, setIsReady] = useState(false);

  const scrollToIndex = useCallback(
    (idx: number, animated = true) => {
      scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated });
    },
    []
  );

  const handleLayout = useCallback(() => {
    if (!isReady) {
      setIsReady(true);
      scrollToIndex(selectedIndex, false);
    }
  }, [isReady, selectedIndex, scrollToIndex]);

  const handleScrollEnd = useCallback(
    (e: any) => {
      const y = e.nativeEvent.contentOffset.y;
      const idx = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      onSelect(clamped);
      scrollToIndex(clamped);
    },
    [items.length, onSelect, scrollToIndex]
  );

  return (
    <View style={[styles.drumOuter, { width }]}>
      {/* Selection highlight */}
      <View style={styles.drumSelector} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        onLayout={handleLayout}
        contentContainerStyle={{
          paddingTop: ITEM_HEIGHT * 2,
          paddingBottom: ITEM_HEIGHT * 2,
        }}
        scrollEventThrottle={16}
      >
        {items.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <TouchableOpacity
              key={item}
              style={styles.drumItem}
              onPress={() => {
                onSelect(idx);
                scrollToIndex(idx);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.drumItemText,
                  isSelected && styles.drumItemTextSelected,
                ]}
                numberOfLines={1}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Password strength meter
// ─────────────────────────────────────────────────────────────────────────────
const getStrength = (p: string): { level: number; label: string; color: string } => {
  if (!p) return { level: 0, label: '', color: 'transparent' };
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', color: '#F2865F' };
  if (score === 2) return { level: 2, label: 'Fair', color: '#F4A47C' };
  if (score === 3) return { level: 3, label: 'Good', color: '#68B36B' };
  return { level: 4, label: 'Strong 🔒', color: '#2FA84F' };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export const SetupScreen: React.FC<SetupScreenProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(0); // 0=profile 1=dob 2=password
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 0 — profile
  const [name, setName] = useState<string>(user?.name ?? '');
  const [username, setUsername] = useState<string>('');
  const [gender, setGender] = useState<GenderOption | null>(null);
  const [about, setAbout] = useState<string>('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Step 1 — dob
  const [monthIdx, setMonthIdx] = useState(0);
  const [dayIdx, setDayIdx] = useState(0);
  const [yearIdx, setYearIdx] = useState(0);

  // Step 2 — password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Progress dots ──────────────────────────────────────────────────────────
  const STEP_LABELS = ['Profile', 'Birthday', 'Password'];

  const slideToStep = (next: number) => {
    const direction = next > step ? 1 : -1;
    slideAnim.setValue(direction * SW);
    setStep(next);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  };

  // ── Username debounced check ───────────────────────────────────────────────
  const checkUsername = async (val: string) => {
    setUsername(val);
    setUsernameError('');
    if (val.length < 3) return;
    setCheckingUsername(true);
    try {
      const res = await apiClient.get(`/onboarding/check-username/${val.toLowerCase()}`);
      if (!res.data?.data?.available) {
        setUsernameError('Username is already taken');
      }
    } catch {
      // ignore network errors for debounce check
    } finally {
      setCheckingUsername(false);
    }
  };

  // ── Step 0 validation ──────────────────────────────────────────────────────
  const validateStep0 = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return false;
    }
    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return false;
    }
    if (usernameError) {
      setError(usernameError);
      return false;
    }
    if (!gender) {
      setError('Please select your gender.');
      return false;
    }
    setError('');
    return true;
  };

  // ── Step 2 submit ──────────────────────────────────────────────────────────
  const handleFinish = async () => {
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Build dateOfBirth from picker
      const month = String(monthIdx + 1).padStart(2, '0');
      const day = String(dayIdx + 1).padStart(2, '0');
      const year = YEARS[yearIdx];
      const dateOfBirth = `${year}-${month}-${day}`;

      const profilePayload = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        dateOfBirth,
        gender,
        interestedIn: ['everyone'],
        about: about.trim() || undefined,
      };

      console.log('\n[SetupScreen] ── POST /onboarding/profile ──────────────────');
      console.log('[SetupScreen] Payload:', JSON.stringify(profilePayload, null, 2));

      // 1. Save profile info + DOB
      const res = await apiClient.post('/onboarding/profile', profilePayload);

      console.log('[SetupScreen] /onboarding/profile status:', res.status);
      console.log('[SetupScreen] /onboarding/profile data:', JSON.stringify(res.data, null, 2));

      const updatedUser = res.data?.data?.user;
      console.log('[SetupScreen] onboardingCompleted in response:', updatedUser?.onboardingCompleted);

      console.log('\n[SetupScreen] ── POST /auth/set-password ───────────────────');
      // 2. Set backup password
      const pwRes = await apiClient.post('/auth/set-password', { password });
      console.log('[SetupScreen] /auth/set-password status:', pwRes.status);

      console.log('[SetupScreen] ── Setup complete, calling onComplete ─────────\n');
      onComplete(updatedUser ?? user);
    } catch (err: any) {
      console.error('[SetupScreen] Setup FAILED:', err?.response?.status, JSON.stringify(err?.response?.data));
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };


  const pwStrength = getStrength(password);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          {step > 0 ? (
            <TouchableOpacity onPress={() => slideToStep(step - 1)} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
          <Text style={styles.headerTitle}>Set Up Your Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Step dots ── */}
        <View style={styles.stepsRow}>
          {STEP_LABELS.map((label, i) => (
            <View key={label} style={styles.stepItem}>
              <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
                {i < step ? (
                  <Text style={styles.stepCheck}>✓</Text>
                ) : (
                  <Text style={[styles.stepNum, i === step && styles.stepNumActive]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Animated slide wrapper ── */}
        <Animated.View
          style={[styles.slideWrapper, { transform: [{ translateX: slideAnim }] }]}
        >
          {/* ══ STEP 0: Profile Info ══ */}
          {step === 0 && (
            <ScrollView
              contentContainerStyle={styles.stepContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.stepHeading}>Tell us about you ✨</Text>
              <Text style={styles.stepSub}>This shows on your public profile.</Text>

              {/* Name */}
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Priya Sharma"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              {/* Username */}
              <Text style={styles.fieldLabel}>Username</Text>
              <View style={styles.usernameRow}>
                <Text style={styles.atSign}>@</Text>
                <TextInput
                  style={[styles.textInput, styles.usernameInput]}
                  placeholder="your_handle"
                  placeholderTextColor={Colors.textMuted}
                  value={username}
                  onChangeText={checkUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                {checkingUsername && (
                  <ActivityIndicator size="small" color={Colors.magenta} style={{ marginLeft: 8 }} />
                )}
              </View>
              {usernameError ? (
                <Text style={styles.fieldError}>{usernameError}</Text>
              ) : username.length >= 3 && !checkingUsername ? (
                <Text style={styles.fieldSuccess}>✓ Username available</Text>
              ) : null}

              {/* Gender */}
              <Text style={[styles.fieldLabel, { marginTop: 8 }]}>Gender</Text>
              <View style={styles.genderGrid}>
                {GENDER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.genderChip,
                      gender === opt.value && styles.genderChipSelected,
                    ]}
                    onPress={() => setGender(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.genderEmoji}>{opt.emoji}</Text>
                    <Text
                      style={[
                        styles.genderLabel,
                        gender === opt.value && styles.genderLabelSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* About */}
              <Text style={[styles.fieldLabel, { marginTop: 8 }]}>About Me (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.aboutInput]}
                placeholder="A short bio that makes people want to ping you..."
                placeholderTextColor={Colors.textMuted}
                value={about}
                onChangeText={setAbout}
                multiline
                maxLength={300}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{about.length}/300</Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title="Continue →"
                onPress={() => {
                  if (validateStep0()) slideToStep(1);
                }}
                style={styles.ctaBtn}
              />
            </ScrollView>
          )}

          {/* ══ STEP 1: Birthday (Drum Picker) ══ */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepHeading}>When's your birthday? 🎂</Text>
              <Text style={styles.stepSub}>
                You must be 18+ to use Ping. Your age shows on your profile.
              </Text>

              <View style={styles.drumRow}>
                <DrumPicker
                  items={MONTHS}
                  selectedIndex={monthIdx}
                  onSelect={setMonthIdx}
                  width={SW * 0.38}
                />
                <DrumPicker
                  items={DAYS}
                  selectedIndex={dayIdx}
                  onSelect={setDayIdx}
                  width={SW * 0.2}
                />
                <DrumPicker
                  items={YEARS}
                  selectedIndex={yearIdx}
                  onSelect={setYearIdx}
                  width={SW * 0.28}
                />
              </View>

              <Text style={styles.dobPreview}>
                {MONTHS[monthIdx]} {dayIdx + 1}, {YEARS[yearIdx]}
              </Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title="Continue →"
                onPress={() => {
                  setError('');
                  slideToStep(2);
                }}
                style={styles.ctaBtn}
              />
            </View>
          )}

          {/* ══ STEP 2: Create Password ══ */}
          {step === 2 && (
            <ScrollView
              contentContainerStyle={styles.stepContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.stepHeading}>Create a password 🔐</Text>
              <Text style={styles.stepSub}>
                Used as a backup sign-in method. Keep it somewhere safe!
              </Text>

              {/* Password */}
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.pwRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
                <TouchableOpacity onPress={() => setShowPw((v) => !v)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIcon}>{showPw ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              {/* Strength bar */}
              {password.length > 0 && (
                <View style={styles.strengthWrapper}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4].map((lvl) => (
                      <View
                        key={lvl}
                        style={[
                          styles.strengthSegment,
                          {
                            backgroundColor:
                              lvl <= pwStrength.level ? pwStrength.color : 'rgba(0,0,0,0.08)',
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: pwStrength.color }]}>
                    {pwStrength.label}
                  </Text>
                </View>
              )}

              {/* Confirm */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Confirm Password</Text>
              <View style={styles.pwRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                  placeholder="Re-enter your password"
                  placeholderTextColor={Colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.fieldError}>Passwords don't match</Text>
              )}
              {confirmPassword.length > 0 && password === confirmPassword && (
                <Text style={styles.fieldSuccess}>✓ Passwords match</Text>
              )}

              {/* Rules */}
              <View style={styles.pwRules}>
                {[
                  { ok: password.length >= 8, text: 'At least 8 characters' },
                  { ok: /[A-Z]/.test(password), text: 'One uppercase letter' },
                  { ok: /[0-9]/.test(password), text: 'One number' },
                ].map((rule) => (
                  <Text
                    key={rule.text}
                    style={[styles.pwRule, rule.ok && styles.pwRuleOk]}
                  >
                    {rule.ok ? '✓' : '○'} {rule.text}
                  </Text>
                ))}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title={loading ? 'Setting up your account…' : 'Complete Setup 🎉'}
                onPress={handleFinish}
                loading={loading}
                style={styles.ctaBtn}
              />
            </ScrollView>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cream,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.white,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: {
    fontSize: 20,
    color: Colors.plum,
    fontWeight: '700',
  },
  headerTitle: {
    ...Typography.bodyStrong,
    color: Colors.plum,
    fontSize: 17,
  },

  // ── Step indicator ──
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 32,
    paddingVertical: 20,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(43, 22, 32, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.magenta,
  },
  stepNum: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  stepNumActive: {
    color: Colors.white,
  },
  stepCheck: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  stepLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
  },
  stepLabelActive: {
    color: Colors.magenta,
    fontWeight: '700',
  },

  // ── Slide wrapper ──
  slideWrapper: {
    flex: 1,
  },
  stepContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  // ── Typography ──
  stepHeading: {
    ...Typography.heading,
    fontSize: 26,
    color: Colors.plum,
    marginBottom: 6,
    marginTop: 4,
  },
  stepSub: {
    ...Typography.body,
    color: Colors.textMuted,
    fontSize: 14,
    marginBottom: 28,
    lineHeight: 20,
  },

  // ── Field ──
  fieldLabel: {
    ...Typography.caption,
    color: Colors.plum,
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: Radius.small,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 22, 32, 0.12)',
    paddingHorizontal: 16,
    height: 52,
    ...Typography.body,
    color: Colors.plum,
    marginBottom: 18,
  },
  aboutInput: {
    height: 100,
    paddingTop: 14,
    paddingBottom: 14,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: -14,
    marginBottom: 14,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  atSign: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.magenta,
    marginRight: 4,
  },
  usernameInput: {
    flex: 1,
    marginBottom: 0,
  },

  // ── Gender ──
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  genderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 22, 32, 0.12)',
  },
  genderChipSelected: {
    borderColor: Colors.magenta,
    backgroundColor: 'rgba(232, 68, 122, 0.08)',
  },
  genderEmoji: { fontSize: 16 },
  genderLabel: {
    ...Typography.caption,
    fontSize: 14,
    color: Colors.plum,
    fontWeight: '600',
  },
  genderLabelSelected: {
    color: Colors.magenta,
  },

  // ── Drum DOB picker ──
  drumRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 16,
    marginBottom: 20,
  },
  drumOuter: {
    height: PICKER_HEIGHT,
    overflow: 'hidden',
    borderRadius: Radius.card,
    backgroundColor: Colors.white,
  },
  drumSelector: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: Colors.magenta,
    zIndex: 10,
    borderRadius: 4,
  },
  drumItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  drumItemText: {
    ...Typography.body,
    color: Colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
  drumItemTextSelected: {
    color: Colors.magenta,
    fontWeight: '700',
    fontSize: 18,
  },
  dobPreview: {
    ...Typography.bodyStrong,
    color: Colors.plum,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },

  // ── Password ──
  pwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.small,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 22, 32, 0.12)',
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 10,
  },
  eyeBtn: {
    padding: 6,
  },
  eyeIcon: {
    fontSize: 18,
  },
  strengthWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  pwRules: {
    gap: 4,
    marginTop: 8,
    marginBottom: 20,
  },
  pwRule: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 13,
  },
  pwRuleOk: {
    color: '#2FA84F',
    fontWeight: '600',
  },

  // ── Feedback ──
  fieldError: {
    ...Typography.caption,
    color: Colors.danger,
    marginTop: 2,
    marginBottom: 10,
  },
  fieldSuccess: {
    ...Typography.caption,
    color: '#2FA84F',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 10,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },

  // ── CTA ──
  ctaBtn: {
    width: '100%',
    marginTop: 8,
  },
});
