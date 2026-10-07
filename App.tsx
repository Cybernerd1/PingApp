import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, Permission, PermissionsAndroid, Platform, StatusBar, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from './src/theme/colors';
import { Typography } from './src/theme/typography';
import { SplashScreen } from './src/screens/auth/SplashScreen';
import { WelcomeScreen } from './src/screens/auth/WelcomeScreen';
import { OnboardingWizard } from './src/screens/onboarding/OnboardingWizard';
import { NotificationToast, ToastConfig } from './src/ui/NotificationToast';
import {
  requestNotificationPermission,
  setupFCMBackgroundHandler,
} from './src/native/fcm';
import { MainShell } from './src/screens/main/MainShell';
import { SessionProvider } from './src/session/SessionContext';
import { GradientBackground, PillButton } from './src/ui';
import {
  GoogleIdentity,
  OnboardingStep,
  SessionState,
  resolveSession,
  signOut,
} from './src/session/session';
import { tokenStore } from './src/session/tokenStore';
import { useQueryClient } from '@tanstack/react-query';
import { UserProfile } from './src/api/types';

const FLIRTY_LINES = [
  'Searching dates for you… 💘',
  'Finding someone worth swiping for… ✨',
  'Warming up the sparks… 🔥',
  'Your next favourite person is loading… 💜',
  'Polishing your perfect match… 😉',
];

const FlirtyLoader: React.FC = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(n => (n + 1) % FLIRTY_LINES.length), 2500);
    return () => clearInterval(t);
  }, []);
  return <Text style={styles.offlineText}>{FLIRTY_LINES[i]}</Text>;
};

// ─── App Step State Machine (v1) ──────────────────────────────────────────────
// splash     → animated brand splash, then resolveSession()
// welcome    → "Love is One Swipe Away" + Google sign-in
// onboarding → Gender → Basics → Interests → Photos → Preferences (resumable)
// main       → Home · Nearby · Chats · My Fans · Profile (all on /api/v1)
// offline    → tokens exist but the server is unreachable (Render cold start)
export type AppStep = 'splash' | 'welcome' | 'onboarding' | 'main' | 'offline';

// Register background FCM handler immediately on app boot
setupFCMBackgroundHandler();

function App(): React.JSX.Element {
  const qc = useQueryClient();
  const [currentStep, setCurrentStep] = useState<AppStep>('splash');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [identity, setIdentity] = useState<GoogleIdentity | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('gender');
  const [offlineMessage, setOfflineMessage] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [mainToast, setMainToast] = useState<ToastConfig | null>(null);

  // Ask for notification permission early; the token is registered after sign-in (MainShell).
  useEffect(() => {
    if (Platform.OS === 'ios') requestNotificationPermission();
  }, []);

  // Ask for camera, mic, location, media/storage and (Android 13+) notifications on first open.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const P = PermissionsAndroid.PERMISSIONS;
    const list: Permission[] = [P.CAMERA, P.RECORD_AUDIO, P.ACCESS_FINE_LOCATION, P.ACCESS_COARSE_LOCATION];
    if (Platform.Version >= 33) {
      list.push(P.READ_MEDIA_IMAGES, P.READ_MEDIA_VIDEO, P.POST_NOTIFICATIONS);
    } else {
      list.push(P.READ_EXTERNAL_STORAGE);
      if (Platform.Version <= 29) list.push(P.WRITE_EXTERNAL_STORAGE);
    }
    PermissionsAndroid.requestMultiple(list).catch(() => {});
  }, []);

  // Refresh token rejected anywhere → back to Welcome.
  useEffect(
    () =>
      tokenStore.onExpired(() => {
        qc.clear();
        setProfile(null);
        setCurrentStep('welcome');
        setToast({ title: 'Session expired', message: 'Please sign in again.', icon: '🔒' });
      }),
    [qc],
  );

  const applySession = useCallback((state: SessionState, opts?: { welcomeBack?: boolean }) => {
    switch (state.status) {
      case 'signedOut':
        setProfile(null);
        setCurrentStep('welcome');
        return;
      case 'offline':
        setOfflineMessage(state.message);
        setCurrentStep('offline');
        return;
      case 'onboarding':
        setProfile(state.profile);
        setIdentity(state.identity);
        setOnboardingStep(state.step);
        setCurrentStep('onboarding');
        return;
      case 'ready':
        setProfile(state.profile);
        setIdentity(state.identity);
        setMainToast(
          opts?.welcomeBack
            ? {
                title: `Welcome back${state.profile.full_name ? `, ${state.profile.full_name.split(' ')[0]}` : ''}!`,
                message: 'Ready to meet some amazing people nearby?',
                icon: '💜',
              }
            : null,
        );
        setCurrentStep('main');
    }
  }, []);

  const handleSplashComplete = async () => {
    setResolving(true);
    try {
      applySession(await resolveSession());
    } catch {
      setCurrentStep('welcome');
    } finally {
      setResolving(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      applySession(await resolveSession());
    } finally {
      setRetrying(false);
    }
  };

  const handleOnboardingComplete = (p: UserProfile | null) => {
    if (!p) {
      handleRetry();
      return;
    }
    setProfile(p);
    setMainToast({
      title: "You're all set! 🎉",
      message: 'Your profile is live. Start swiping to meet people nearby!',
      icon: '✨',
    });
    setCurrentStep('main');
  };

  const handleLogout = useCallback(async () => {
    await signOut();
    qc.clear();
    setProfile(null);
    setIdentity(null);
    setCurrentStep('welcome');
  }, [qc]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider style={styles.flex}>
        <StatusBar barStyle="dark-content" />

        <NotificationToast toast={toast} onDismiss={() => setToast(null)} />

        {currentStep === 'splash' && <SplashScreen onComplete={handleSplashComplete} />}

        {currentStep === 'splash' && resolving && (
          <GradientBackground>
            <SafeAreaView style={styles.offline}>
              <ActivityIndicator size="large" color={Colors.coral} />
              <FlirtyLoader />
            </SafeAreaView>
          </GradientBackground>
        )}

        {currentStep === 'welcome' && <WelcomeScreen onSignedIn={state => applySession(state, { welcomeBack: true })} />}

        {currentStep === 'onboarding' && (
          <OnboardingWizard
            initialStep={onboardingStep}
            profile={profile}
            identity={identity}
            onComplete={handleOnboardingComplete}
            onExit={handleLogout}
          />
        )}

        {currentStep === 'offline' && (
          <GradientBackground>
            <SafeAreaView style={styles.offline}>
              <Text style={styles.offlineTitle}>Can’t reach Ping</Text>
              <Text style={styles.offlineText}>{offlineMessage}</Text>
              <PillButton title="Try again" onPress={handleRetry} loading={retrying} />
              <PillButton title="Sign out" variant="ghost" onPress={handleLogout} style={styles.offlineSignOut} />
            </SafeAreaView>
          </GradientBackground>
        )}

        {currentStep === 'main' && profile && (
          <SessionProvider initialProfile={profile} identity={identity} onSignOut={handleLogout}>
            <MainShell welcomeToast={mainToast} />
          </SessionProvider>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  flex: { flex: 1 },
  offline: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 12 },
  offlineTitle: { ...Typography.title, color: Colors.ink },
  offlineText: { ...Typography.body, color: Colors.mute, marginBottom: 12 },
  offlineSignOut: { marginTop: 4 },
});

export default App;
