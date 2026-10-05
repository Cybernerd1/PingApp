import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GradientBackground, PillButton, StepHeader } from '../../ui';

interface StepLayoutProps {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  error?: string | null;
  /** Left footer slot — e.g. the round "Skip For Now" glass button. */
  footerLeft?: React.ReactNode;
  scroll?: boolean;
  children: React.ReactNode;
}

/** Shared frame for every onboarding step: header, title, body, round black "Next". */
export const StepLayout: React.FC<StepLayoutProps> = ({
  step,
  total,
  title,
  subtitle,
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled,
  loading,
  error,
  footerLeft,
  scroll = true,
  children,
}) => {
  const inner = (
    <>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </>
  );
  return (
    <GradientBackground variant="soft">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <StepHeader step={step} total={total} onBack={onBack} />
          {scroll ? (
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {inner}
            </ScrollView>
          ) : (
            <View style={[styles.flex, styles.content]}>{inner}</View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.footer}>
            {footerLeft ?? <View />}
            <PillButton round size={72} title={nextLabel} onPress={onNext} disabled={nextDisabled} loading={loading} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  title: { ...Typography.title, fontSize: 30, lineHeight: 36, color: Colors.ink },
  subtitle: { ...Typography.body, color: Colors.mute, marginTop: 6, marginBottom: 22 },
  error: { ...Typography.label, color: Colors.danger, paddingHorizontal: 24, marginBottom: 6 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 6,
  },
});
