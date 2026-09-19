import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from './src/theme/colors';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AuthScreen } from './src/screens/AuthScreen';
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

export type AppStep = 'onboarding' | 'auth' | 'main';

// Register background message handler immediately on app boot
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
  const [currentStep, setCurrentStep] = useState<AppStep>('onboarding');
  const [activeTab, setActiveTab] = useState<MainTabType>('home');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Notification Toast & Modal state
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);

  useEffect(() => {
    // Setup FCM Push Notification permissions & foreground listener
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

  const handleOnboardingComplete = () => {
    setCurrentStep('auth');
  };

  const handleAuthSuccess = (userData: any) => {
    setCurrentUser(userData);
    setCurrentStep('main');

    // Trigger welcoming FCM notification toast
    setTimeout(() => {
      setToast({
        title: 'Welcome to Ping! 💖',
        message: 'Your profile is active. Start swiping to meet awesome people nearby!',
        icon: '✨',
      });
    }, 800);
  };

  const handleLogout = () => {
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

        {currentStep === 'onboarding' && (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}

        {currentStep === 'auth' && (
          <AuthScreen onSuccess={handleAuthSuccess} />
        )}

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
                <ProfileScreen user={currentUser} onLogout={handleLogout} />
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
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  screenContent: {
    flex: 1,
  },
});

export default App;
