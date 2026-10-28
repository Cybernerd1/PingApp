
/**
 * Firebase Cloud Messaging wrapper.
 *
 * Uses the React Native Firebase modular API.
 * Safely handles builds where the native messaging module is unavailable.
 */

import {
  NativeModules,
  PermissionsAndroid,
  Platform,
  TurboModuleRegistry,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { getApp } from '@react-native-firebase/app';

import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  getInitialNotification,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh as firebaseOnTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

type Messaging = ReturnType<typeof getMessaging>;

export interface FCMNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

let cached: Messaging | null | undefined;
let warned = false;

/** Check whether the native messaging module is installed. */
export const isPushAvailable = (): boolean => {
  const name = 'RNFBMessagingModule';

  return !!(NativeModules[name] ?? TurboModuleRegistry.get(name));
}

/** Return the modular Firebase Messaging instance. */
function messagingModule(): Messaging | null {
  if (cached !== undefined) {
    return cached;
  }

  if (!isPushAvailable()) {
    if (__DEV__ && !warned) {
      warned = true;
      console.warn(
        '[FCM] Native messaging module is unavailable. ' +
          'Rebuild the app using npm run android.',
      );
    }

    cached = null;
    return cached;
  }

  try {
    cached = getMessaging(getApp());
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[FCM] Failed to initialize messaging:',
        (error as Error)?.message,
      );
    }

    cached = null;
  }

  return cached;
}

/**
 * Register once at application bundle load, in index.js.
 * Do not call this from a React component or useEffect.
 */
export const setupFCMBackgroundHandler = (): void => {
  const messaging = messagingModule();

  if (!messaging) {
    return;
  }

  try {
    setBackgroundMessageHandler(messaging, async msg => {
      // Android displays notification payloads through the OS when
      // appropriate. Persist the event for the in-app notification inbox.
      try {
        const raw = await AsyncStorage.getItem('ping.notifications.v1');

        const list: Array<Record<string, any>> = raw
          ? JSON.parse(raw)
          : [];

        const type = msg.data?.type;

        list.unshift({
          id: `${Date.now()}-${
            msg.messageId ?? Math.random().toString(36).slice(2, 7)
          }`,
          title:
            msg.notification?.title ??
            msg.data?.sender_name ??
            'Ping',
          body: msg.notification?.body ?? '',
          icon: type === 'match' ? '✨' : type === 'like' ? '💜' : '💬',
          at: Date.now(),
          read: false,
          kind:
            type === 'match'
              ? 'match'
              : type === 'like'
                ? 'like'
                : 'message',
          chatId: msg.data?.chat_id,
          avatarUrl: msg.data?.avatar_url,
        });

        await AsyncStorage.setItem(
          'ping.notifications.v1',
          JSON.stringify(list.slice(0, 200)),
        );
      } catch (error) {
        if (__DEV__) {
          console.warn('[FCM] Failed to persist background message:', error);
        }
      }
    });
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[FCM] Background handler registration failed:',
        (error as Error)?.message,
      );
    }
  }
};

/** Android 13+ runtime permission and iOS notification authorization. */
export const requestNotificationPermission =
  async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        if (Number(Platform.Version) < 33) {
          return true;
        }

        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        return result === PermissionsAndroid.RESULTS.GRANTED;
      }

      if (Platform.OS === 'ios') {
        const messaging = messagingModule();

        if (!messaging) {
          return false;
        }

        const status = await requestPermission(messaging);

        return (
          status === AuthorizationStatus.AUTHORIZED ||
          status === AuthorizationStatus.PROVISIONAL
        );
      }

      return false;
    } catch (error) {
      if (__DEV__) {
        console.warn('[FCM] Permission request failed:', error);
      }

      return false;
    }
  };

/** Get the actual FCM registration token, or null when unavailable. */
export const getFCMToken = async (): Promise<string | null> => {
  const messaging = messagingModule();

  if (!messaging) {
    return null;
  }

  try {
    const token = await getToken(messaging);

    if (__DEV__) {
      console.log('[FCM] Token retrieved successfully');
    }

    return token;
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[FCM] Token retrieval failed:',
        (error as Error)?.message,
      );
    }

    return null;
  }
};

/** Subscribe to token rotation. Returns an unsubscribe function. */
export const onTokenRefresh = (
  callback: (token: string) => void,
): (() => void) => {
  const messaging = messagingModule();

  return messaging
    ? firebaseOnTokenRefresh(messaging, callback)
    : () => {};
};

/**
 * Handles notifications tapped while the app is in the background
 * or launched from a terminated state.
 */
export const onNotificationOpened = (
  callback: (data: Record<string, any>) => void,
): (() => void) => {
  const messaging = messagingModule();

  if (!messaging) {
    return () => {};
  }

  let active = true;

  getInitialNotification(messaging)
    .then(message => {
      if (active && message?.data) {
        callback(message.data);
      }
    })
    .catch(error => {
      if (__DEV__) {
        console.warn('[FCM] Initial notification lookup failed:', error);
      }
    });

  const unsubscribe = onNotificationOpenedApp(messaging, message => {
    if (active && message?.data) {
      callback(message.data);
    }
  });

  return () => {
    active = false;
    unsubscribe();
  };
};

/** Listen for push messages while the app is in the foreground. */
export const onForegroundMessage = (
  listener: (payload: FCMNotificationPayload) => void,
): (() => void) => {
  const messaging = messagingModule();

  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, async message => {
    listener({
      title: message.notification?.title ?? 'Ping',
      body: message.notification?.body ?? '',
      data: message.data,
    });
  });
};
