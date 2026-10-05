/**
 * Firebase Cloud Messaging wrapper.
 *
 * Uses @react-native-firebase/messaging when its native module is present in the
 * installed app. If the APK was built before the package was added, every call
 * is a safe no-op (no fake token, no red-box) — rebuild with `npm run android`.
 */
import { NativeModules, PermissionsAndroid, Platform, TurboModuleRegistry } from 'react-native';

export interface FCMNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

type Messaging = typeof import('@react-native-firebase/messaging').default;

let cached: Messaging | null | undefined;
let warned = false;

/** True when the native RNFB messaging module is compiled into this build. */
export const isPushAvailable = (): boolean => {
  const name = 'RNFBMessagingModule';
  return !!(NativeModules[name] ?? TurboModuleRegistry.get(name));
};

function messagingModule(): Messaging | null {
  if (cached !== undefined) return cached;
  if (!isPushAvailable()) {
    if (__DEV__ && !warned) {
      warned = true;
      console.warn(
        '[FCM] Native messaging module is not in this build — push is disabled. ' +
          'Rebuild the app: npm install && npm run android',
      );
    }
    cached = null;
    return cached;
  }
  cached = require('@react-native-firebase/messaging').default as Messaging;
  return cached;
}

/** Must run at bundle load (index.js) so Android can deliver data while the app is closed. */
export const setupFCMBackgroundHandler = () => {
  const m = messagingModule();
  m?.().setBackgroundMessageHandler(async () => {
    // Notification messages are displayed by the OS; nothing to do here.
  });
};

/** Android 13+ runtime permission + iOS authorization. */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version < 33) return true;
      const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      return res === PermissionsAndroid.RESULTS.GRANTED;
    }
    const m = messagingModule();
    if (!m) return false;
    const status = await m().requestPermission();
    return status === m.AuthorizationStatus.AUTHORIZED || status === m.AuthorizationStatus.PROVISIONAL;
  } catch {
    return false;
  }
};

/** Real FCM registration token, or null if push isn't available in this build. */
export const getFCMToken = async (): Promise<string | null> => {
  const m = messagingModule();
  if (!m) return null;
  try {
    const token = await m().getToken();
    if (__DEV__) console.log('[FCM] token:', token);
    return token;
  } catch (e) {
    if (__DEV__) console.warn('[FCM] getToken failed:', (e as Error)?.message);
    return null;
  }
};

/** Token rotation. Returns an unsubscribe fn. */
export const onTokenRefresh = (cb: (token: string) => void): (() => void) => {
  const m = messagingModule();
  return m ? m().onTokenRefresh(cb) : () => {};
};

/**
 * A notification was tapped while the app was in the background, or the app
 * was launched by tapping one. `cb` receives the push `data` (e.g. chat_id).
 */
export const onNotificationOpened = (cb: (data: Record<string, any>) => void): (() => void) => {
  const m = messagingModule();
  if (!m) return () => {};
  m()
    .getInitialNotification()
    .then(msg => {
      if (msg?.data) cb(msg.data);
    })
    .catch(() => {});
  return m().onNotificationOpenedApp(msg => {
    if (msg?.data) cb(msg.data);
  });
};

/** Pushes that arrive while the app is open (the OS doesn't show these). */
export const onForegroundMessage = (listener: (p: FCMNotificationPayload) => void): (() => void) => {
  const m = messagingModule();
  if (!m) return () => {};
  return m().onMessage(async msg => {
    listener({
      title: msg.notification?.title ?? 'Ping',
      body: msg.notification?.body ?? '',
      data: msg.data,
    });
  });
};
