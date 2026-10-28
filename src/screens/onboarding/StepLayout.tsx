import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GradientBackground, PillButton, StepHeader } from '../../ui';
import { useKeyboardPadding } from '../../ui/useKeyboardPadding';

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
  const { pad, onContainerLayout } = useKeyboardPadding();
  const insets = useSafeAreaInsets();
  const bottomPad = pad > 0 ? pad : insets.bottom;
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
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.flex, { paddingBottom: bottomPad }]} onLayout={onContainerLayout}>
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

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}
          <View style={styles.footer}>
            {footerLeft ?? <View />}
            <PillButton round size={72} title={nextLabel} onPress={onNext} disabled={nextDisabled} loading={loading} />
          </View>
        </View>
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
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(220,53,69,0.09)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
  },
  error: { ...Typography.label, color: Colors.danger },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 6,
  },
});
