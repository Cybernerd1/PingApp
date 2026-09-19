import { Alert, PermissionsAndroid, Platform } from 'react-native';

export interface FCMNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  avatarUrl?: string;
}

// Background notification handler callback store
type NotificationListener = (payload: FCMNotificationPayload) => void;
let foregroundListeners: NotificationListener[] = [];

/**
 * Register FCM Background Message Handler
 * This executes when the app is in background or completely quit.
 */
export const setupFCMBackgroundHandler = () => {
  try {
    // Attempt dynamic import of @react-native-firebase/messaging if installed
    const messaging = require('@react-native-firebase/messaging').default;
    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
      console.log('🔔 [FCM Background Notification Received]:', remoteMessage);
    });
  } catch (_) {
    console.log('💡 [FCM]: Native @react-native-firebase/messaging not linked yet. Simulated background push ready.');
  }
};

/**
 * Request Notification Permissions (Android 13+ & iOS)
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    try {
      const messaging = require('@react-native-firebase/messaging').default;
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    } catch (_) {
      return true;
    }
  } catch {
    return false;
  }
};

/**
 * Get Device FCM Token
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const messaging = require('@react-native-firebase/messaging').default;
    const token = await messaging().getToken();
    console.log('🔑 [FCM Token]:', token);
    return token;
  } catch (_) {
    const mockToken = 'fcm_mock_device_token_ping_app_123456789';
    console.log('🔑 [FCM Token (Simulated)]:', mockToken);
    return mockToken;
  }
};

/**
 * Subscribe to Foreground Push Notifications
 */
export const onForegroundMessage = (listener: NotificationListener) => {
  foregroundListeners.push(listener);

  try {
    const messaging = require('@react-native-firebase/messaging').default;
    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      const payload: FCMNotificationPayload = {
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || 'You have a new update on Ping!',
        data: remoteMessage.data,
        avatarUrl: remoteMessage.data?.avatarUrl,
      };
      listener(payload);
    });

    return () => {
      unsubscribe();
      foregroundListeners = foregroundListeners.filter((l) => l !== listener);
    };
  } catch (_) {
    return () => {
      foregroundListeners = foregroundListeners.filter((l) => l !== listener);
    };
  }
};

/**
 * Trigger Simulated Notification (For Testing FCM Push locally)
 */
export const triggerSimulatedPushNotification = (payload: FCMNotificationPayload) => {
  foregroundListeners.forEach((listener) => listener(payload));
};
