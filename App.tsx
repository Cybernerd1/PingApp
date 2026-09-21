import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from './src/theme/colors';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { PhotoUploadScreen } from './src/screens/PhotoUploadScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { Header } from './src/components/Header';
import { BottomNavBar, MainTabType } from './src/components/common/BottomNavBar';
import { NotificationToast, ToastConfig } from './src/components/common/NotificationToast';
import { NotificationsModal, NotificationItem } from './src/components/modals/NotificationsModal';
import {
  setupFCMBackgroundHandler,
  requestNotificationPermission,
  getFCMToken,
  onForegroundMessage,
} from './src/services/fcmService';
import { requestAllPermissions } from './src/services/permissionsService';
import { checkInitialSession, signOutAll } from './src/services/authService';

// ─── App Step State Machine ───────────────────────────────────────────────────
// loading    → determine where to go on boot
// onboarding → marketing slides (first launch ONLY, unauthenticated)
// auth       → sign-in screen (Google only)
// setup      → account setup wizard (new users after Google sign-in)
// photos     → photo upload screen (1 profile photo + up to 3 extra)
// main       → full app (authenticated + onboarding complete)
export type AppStep = 'loading' | 'onboarding' | 'auth' | 'setup' | 'photos' | 'main';

// Register background FCM handler immediately on app boot
setupFCMBackgroundHandler();

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'It is a Match! 💖',
    message: 'Sophia liked your profile back. Send her a message now!',
    time: '5m ago',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    unread: true,
    type: 'match',
  },
  {
    id: 'n2',
    title: 'Super Ping Received! ⭐',
    message: 'Liam sent you a Super Ping! Check out his music prompts.',
    time: '1h ago',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    unread: true,
    type: 'like',
  },
  {
    id: 'n3',
    title: 'Welcome to Ping! ✨',
    message: 'Complete your profile details to get 2x more candidate matches nearby.',
    time: '1d ago',
    unread: false,
    type: 'system',
  },
];

function App(): React.JSX.Element {
  const [currentStep, setCurrentStep] = useState<AppStep>('loading');
  const [activeTab, setActiveTab] = useState<MainTabType>('home');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Notification state
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);

  // ── Boot: resolve initial step & permissions ─────────────────────────────
  useEffect(() => {
    const resolveInitialStep = async () => {
      try {
        // Request all runtime permissions on app boot (camera, mic, location, storage)
        requestAllPermissions();

        // 1. Validate session via Keychain → GET /auth/me
        const session = await checkInitialSession();

        if (session.authenticated && session.user) {
          setCurrentUser(session.user);
          const step = session.user?.onboardingStep;

          if (session.onboardingComplete || step === 'completed') {
            setCurrentStep('main');
          } else if (step === 'photos') {
            setCurrentStep('photos');
          } else {
            setCurrentStep('setup');
          }
          return;
        }

        // 2. Not authenticated — show slides only on first ever launch
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
          setCurrentStep('onboarding'); // first launch → slides → auth
        } else {
          setCurrentStep('auth'); // returning logged-out user → auth directly
        }
      } catch {
        // Fail safe to auth
        setCurrentStep('auth');
      }
    };

    resolveInitialStep();

    // 3. Setup FCM push notifications
    requestNotificationPermission().then(() => {
      getFCMToken();
    });

    const unsubscribeFCM = onForegroundMessage((payload) => {
      setToast({
        title: payload.title,
        message: payload.body,
        avatarUrl: payload.avatarUrl,
        onPress: () => setNotificationsModalVisible(true),
      });

      setNotifications((prev) => [
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

  // ── Handlers ───────────────────────────────────────────────────────────────

  // Marketing slides complete → go to auth
  const handleOnboardingComplete = () => {
    setCurrentStep('auth');
  };

  // Google sign-in succeeded
  const handleAuthSuccess = (result: { user: any; isNewUser: boolean; onboardingComplete: boolean }) => {
    setCurrentUser(result.user);
    const step = result.user?.onboardingStep;

    if (result.onboardingComplete || step === 'completed') {
      setCurrentStep('main');
      setTimeout(() => {
        setToast({
          title: 'Welcome back! 💖',
          message: 'Ready to meet some amazing people nearby?',
          icon: '⚡',
        });
      }, 600);
    } else if (step === 'photos') {
      setCurrentStep('photos');
    } else {
      setCurrentStep('setup');
    }
  };

  // Setup wizard complete → go to photo upload step
  const handleSetupComplete = (updatedUser: any) => {
    setCurrentUser(updatedUser ?? currentUser);
    setCurrentStep('photos');
  };

  // Photo upload step complete → go to main app
  const handlePhotosComplete = (updatedUser: any) => {
    setCurrentUser(updatedUser ?? currentUser);
    setCurrentStep('main');

    setTimeout(() => {
      setToast({
        title: 'You\'re all set! 🎉',
        message: 'Your profile is live. Start swiping to meet people nearby!',
        icon: '✨',
      });
    }, 600);
  };

  // Logout
  const handleLogout = async () => {
    await signOutAll();
    setCurrentUser(null);
    setCurrentStep('auth');
    setActiveTab('home');
  };

  const unreadNotificationCount = notifications.filter((n) => n.unread).length;

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />

        {/* Global Notification Toast */}
        <NotificationToast toast={toast} onDismiss={() => setToast(null)} />

        {/* ── Loading ── */}
        {currentStep === 'loading' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.magenta} />
          </View>
        )}

        {/* ── Marketing Slides (first launch only) ── */}
        {currentStep === 'onboarding' && (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}

        {/* ── Sign In ── */}
        {currentStep === 'auth' && (
          <AuthScreen onSuccess={handleAuthSuccess} />
        )}

        {/* ── Account Setup Wizard (new users) ── */}
        {currentStep === 'setup' && (
          <SetupScreen
            user={currentUser}
            onComplete={handleSetupComplete}
          />
        )}

        {/* ── Photo Upload Step ── */}
        {currentStep === 'photos' && (
          <PhotoUploadScreen
            user={currentUser}
            onComplete={handlePhotosComplete}
          />
        )}

        {/* ── Main App ── */}
        {currentStep === 'main' && (
          <SafeAreaView style={styles.safeArea}>
            {/* Top Header: Ping Brand Title & Notification Icon ONLY */}
            <Header
              unreadCount={unreadNotificationCount}
              onNotificationPress={() => {
                setNotificationsModalVisible(true);
                // Mark notifications as read when opened
                setNotifications((prev) =>
                  prev.map((n) => ({ ...n, unread: false }))
                );
              }}
            />

            {/* Main Screen Body */}
            <View style={styles.screenContent}>
              {activeTab === 'home' && (
                <HomeScreen onOpenChat={() => setActiveTab('chat')} />
              )}

              {activeTab === 'chat' && <ChatScreen />}

              {activeTab === 'profile' && (
                <ProfileScreen
                  user={currentUser}
                  onLogout={handleLogout}
                  onUserUpdate={(updated) => setCurrentUser(updated)}
                />
              )}
            </View>

            {/* Bottom Navbar (Home, Chat, Profile) */}
            <BottomNavBar
              activeTab={activeTab}
              onTabSelect={setActiveTab}
              unreadChatCount={1}
            />

            {/* Notifications Modal */}
            <NotificationsModal
              visible={notificationsModalVisible}
              notifications={notifications}
              onClose={() => setNotificationsModalVisible(false)}
              onClearAll={() => setNotifications([])}
              onSelectNotification={(item) => {
                setNotificationsModalVisible(false);
                if (item.type === 'match' || item.type === 'message') {
                  setActiveTab('chat');
                }
              }}
            />
          </SafeAreaView>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cream,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  screenContent: {
    flex: 1,
  },
});

export default App;
