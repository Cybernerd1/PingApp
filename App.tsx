import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from './src/theme/colors';
import { Typography } from './src/theme/typography';
import { SplashScreen } from './src/screens/SplashScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { OnboardingWizard } from './src/screens/onboarding/OnboardingWizard';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { NotificationsScreen, NotificationItem } from './src/screens/NotificationsScreen';
import { Header } from './src/components/Header';
import { BottomNavBar, MainTabType } from './src/components/common/BottomNavBar';
import { NotificationToast, ToastConfig } from './src/components/common/NotificationToast';
import {
  setupFCMBackgroundHandler,
  requestNotificationPermission,
  getFCMToken,
  onForegroundMessage,
} from './src/services/fcmService';
import { GradientBackground, PillButton } from './src/ui';
import {
  GoogleIdentity,
  OnboardingStep,
  SessionState,
  resolveSession,
  signOut,
} from './src/session/session';
import { tokenStore } from './src/session/tokenStore';
import { UserProfile } from './src/api/types';

// ─── App Step State Machine (v1) ──────────────────────────────────────────────
// splash     → animated brand splash, then resolveSession()
// welcome    → "Love is One Swipe Away" + Google sign-in
// onboarding → Gender → Basics → Interests → Photos → Preferences (resumable)
// main       → tabs (Phase 2–4 will restyle these to the new design)
// offline    → tokens exist but the server is unreachable (Render cold start)
export type AppStep = 'splash' | 'welcome' | 'onboarding' | 'main' | 'offline';

// Register background FCM handler immediately on app boot
setupFCMBackgroundHandler();

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'It\'s a Match! 💖',
    message: 'Ananya liked your profile back. Send her a message now!',
    time: '5m ago',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    unread: true,
    type: 'match',
  },
  {
    id: 'n2',
    title: 'New match with Rohan! 🎉',
    message: 'That place looks amazing!',
    time: '1h ago',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    unread: true,
    type: 'match',
  },
  {
    id: 'n3',
    title: 'Meera sent you a message',
    message: 'That place looks amazing!',
    time: '1h ago',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
    unread: false,
    type: 'message',
  },
  {
    id: 'n4',
    title: 'Ananya liked your profile ❤️',
    message: '6m ago',
    time: '6m ago',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    unread: true,
    type: 'like',
  },
  {
    id: 'n5',
    title: '3 new people liked your profile',
    message: 'Check who\'s interested in you',
    time: '2h ago',
    unread: false,
    type: 'like',
  },
  {
    id: 'n6',
    title: 'Your profile was viewed 5 times',
    message: 'Complete your profile to get more views!',
    time: '3h ago',
    unread: false,
    type: 'system',
  },
  {
    id: 'n7',
    title: 'Simran matched with you',
    message: 'Start a conversation now!',
    time: '5h ago',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    unread: false,
    type: 'match',
  },
];

/** Shape the legacy Profile tab expects, built from the v1 profile. */
function toLegacyUser(profile: UserProfile | null, identity: GoogleIdentity | null) {
  if (!profile) return null;
  const photos = [...(profile.photos ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return {
    ...profile,
    id: profile.user_id,
    name: profile.full_name,
    email: identity?.email,
    avatar: photos[0]?.photo_url ?? identity?.photo,
    photos: photos.map(p => ({ ...p, url: p.photo_url })),
  };
}

function App(): React.JSX.Element {
  const [currentStep, setCurrentStep] = useState<AppStep>('splash');
  const [activeTab, setActiveTab] = useState<MainTabType>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [identity, setIdentity] = useState<GoogleIdentity | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('gender');
  const [offlineMessage, setOfflineMessage] = useState('');
  const [retrying, setRetrying] = useState(false);

  // Notification state
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // ── Boot: FCM ───────────────────────────────────────────────────────────
  useEffect(() => {
    requestNotificationPermission().then(() => {
      getFCMToken();
    });

    const unsubscribeFCM = onForegroundMessage(payload => {
      setToast({
        title: payload.title,
        message: payload.body,
        avatarUrl: payload.avatarUrl,
        onPress: () => setActiveTab('notifications'),
      });
      setNotifications(prev => [
        {
          id: `fcm_${Date.now()}`,
          title: payload.title,
          message: payload.body,
          time: 'Just now',
          avatarUrl: payload.avatarUrl,
          unread: true,
          type: 'match',
        },
        ...prev,
      ]);
    });

    return () => unsubscribeFCM();
  }, []);

  // ── Refresh token rejected anywhere → back to Welcome ──────────────────
  useEffect(
    () =>
      tokenStore.onExpired(() => {
        setProfile(null);
        setCurrentStep('welcome');
        setToast({ title: 'Session expired', message: 'Please sign in again.', icon: '🔒' });
      }),
    [],
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
        setCurrentStep('main');
        if (opts?.welcomeBack) {
          setTimeout(
            () =>
              setToast({
                title: `Welcome back${state.profile.full_name ? `, ${state.profile.full_name.split(' ')[0]}` : ''}!`,
                message: 'Ready to meet some amazing people nearby?',
                icon: '💜',
              }),
            600,
          );
        }
    }
  }, []);

  const handleSplashComplete = async () => {
    try {
      applySession(await resolveSession());
    } catch {
      setCurrentStep('welcome');
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
    setProfile(p);
    setCurrentStep('main');
    setTimeout(() => {
      setToast({
        title: "You're all set! 🎉",
        message: 'Your profile is live. Start swiping to meet people nearby!',
        icon: '✨',
      });
    }, 600);
  };

  // Dev-only: jump into the (legacy, mock-data) main tabs without signing in.
  const handleExploreDemo = () => {
    setProfile({
      user_id: 'demo_user_1',
      full_name: 'Alex Rivers',
      gender: 'other',
      bio: 'Exploring coffee spots, UI design & vinyl records! ☕✨',
      photos: [],
    });
    setCurrentStep('main');
  };

  const handleLogout = async () => {
    await signOut();
    setProfile(null);
    setIdentity(null);
    setCurrentStep('welcome');
    setActiveTab('home');
  };

  const unreadNotificationCount = notifications.filter(n => n.unread).length;
  const legacyUser = toLegacyUser(profile, identity);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider style={styles.flex}>
        <StatusBar barStyle="dark-content" />

        <NotificationToast toast={toast} onDismiss={() => setToast(null)} />

        {currentStep === 'splash' && <SplashScreen onComplete={handleSplashComplete} />}

        {currentStep === 'welcome' && (
          <WelcomeScreen
            onSignedIn={state => applySession(state, { welcomeBack: true })}
            onExploreDemo={handleExploreDemo}
          />
        )}

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

        {/* ── Main App (legacy tabs — restyled in Phases 2–4) ── */}
        {currentStep === 'main' && (
          <SafeAreaView style={styles.safeArea}>
            <Header
              unreadCount={unreadNotificationCount}
              onNotificationPress={() => setActiveTab('notifications')}
            />

            <View style={styles.flex}>
              {activeTab === 'home' && <HomeScreen onOpenChat={() => setActiveTab('chat')} />}

              {activeTab === 'chat' && <ChatScreen />}

              {activeTab === 'notifications' && (
                <NotificationsScreen
                  notifications={notifications}
                  onClearAll={() => setNotifications([])}
                  onSelectNotification={item => {
                    if (item.type === 'match' || item.type === 'message') {
                      setActiveTab('chat');
                    }
                  }}
                  onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileScreen user={legacyUser} onLogout={handleLogout} onUserUpdate={() => undefined} />
              )}
            </View>

            <BottomNavBar
              activeTab={activeTab}
              onTabSelect={setActiveTab}
              unreadChatCount={0}
              unreadNotificationCount={unreadNotificationCount}
            />
          </SafeAreaView>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: Colors.cream },
  offline: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 12 },
  offlineTitle: { ...Typography.title, color: Colors.ink },
  offlineText: { ...Typography.body, color: Colors.mute, marginBottom: 12 },
  offlineSignOut: { marginTop: 4 },
});

export default App;
