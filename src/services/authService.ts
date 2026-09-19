// Apple Sign-In removed 2026-09-20 due to an AGP 9 / kotlin-android plugin conflict in @invertase/react-native-apple-authentication's Android build.gradle. Must be re-added before iOS submission — see codebase history for the original implementation.

/**
 * Firebase Auth & Native Google Sign-In Service
 */

import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import DeviceInfo from 'react-native-device-info';
import apiClient, { setAuthToken } from './apiClient';
import { saveTokens, getTokens, clearTokens } from './authStorage';
import { ENV } from '../config/env';

/**
 * Configure Google Sign-In with Web Client ID
 */
export const configureGoogleSignIn = () => {
  try {
    GoogleSignin.configure({
      webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  } catch (err) {
    console.log('💡 [GoogleSignin config]:', err);
  }
};

export interface AuthResult {
  user: any;
  accessToken: string;
  refreshToken: string;
}

/**
 * Perform Native Google Sign-In + Firebase Auth Credential Exchange + Backend Verification
 * Throws on any error — no mock fallback data.
 */
export const signInWithGoogle = async (): Promise<AuthResult> => {
  configureGoogleSignIn();

  // Ensure Google Play Services are available on Android
  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  // Trigger Native Google Account Picker (@react-native-google-signin/google-signin v13.1.0 API)
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken;

  if (!idToken) {
    throw new Error('Google Sign-In failed: No ID Token received from Google.');
  }

  // Exchange Google ID Token for Firebase Auth Credential
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  const userCredential = await auth().signInWithCredential(googleCredential);

  // Obtain Firebase ID Token to verify with Ping backend
  const firebaseIdToken = await userCredential.user.getIdToken(true);
  const deviceId = await DeviceInfo.getUniqueId();

  // Send Firebase ID Token & Device ID to backend POST /auth/verify
  const res = await apiClient.post('/auth/verify', {
    firebaseIdToken,
    deviceId,
  });

  const authData = res.data?.data;
  const accessToken = authData?.accessToken;
  const refreshToken = authData?.refreshToken;

  if (!accessToken || !refreshToken) {
    throw new Error('Authentication failed: Server response is missing access token or refresh token.');
  }

  const user = authData?.user || {
    id: userCredential.user.uid,
    email: userCredential.user.email,
    username: userCredential.user.displayName || 'PingUser',
    avatar: userCredential.user.photoURL,
    onboardingComplete: false,
  };

  // Store tokens in Keychain & update Axios headers
  const saved = await saveTokens(accessToken, refreshToken);
  if (!saved) {
    throw new Error('Failed to save session. Please try signing in again.');
  }
  setAuthToken(accessToken);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/**
 * Sign out completely from Firebase, Google, and clear Keychain stored tokens
 */
export const signOutAll = async (): Promise<void> => {
  try {
    await auth().signOut().catch(() => { });
    await GoogleSignin.signOut().catch(() => { });
  } catch (_) { }

  await clearTokens();
  setAuthToken(null);
};

/**
 * On App Launch: Check Keychain stored tokens, validate session, and determine routing.
 * Fails closed safely to authenticated: false if session cannot be validated.
 */
export const checkInitialSession = async (): Promise<{
  authenticated: boolean;
  user: any;
  onboardingComplete: boolean;
}> => {
  try {
    const tokens = await getTokens();

    if (!tokens || !tokens.accessToken) {
      return { authenticated: false, user: null, onboardingComplete: false };
    }

    setAuthToken(tokens.accessToken);

    try {
      // Validate session with backend GET /users/me
      const res = await apiClient.get('/users/me');
      const user = res.data?.data?.user;

      if (user) {
        return {
          authenticated: true,
          user,
          onboardingComplete: !!user.onboardingComplete,
        };
      }
    } catch (err: any) {
      // If 401, attempt silent refresh via POST /auth/refresh
      if (err.response?.status === 401 && tokens.refreshToken) {
        try {
          const refreshRes = await apiClient.post('/auth/refresh', {
            refreshToken: tokens.refreshToken,
          });
          const newAccess = refreshRes.data?.data?.accessToken;
          const newRefresh = refreshRes.data?.data?.refreshToken || tokens.refreshToken;

          if (newAccess) {
            await saveTokens(newAccess, newRefresh);
            setAuthToken(newAccess);

            const meRes = await apiClient.get('/users/me');
            const meUser = meRes.data?.data?.user;
            if (meUser) {
              return {
                authenticated: true,
                user: meUser,
                onboardingComplete: !!meUser.onboardingComplete,
              };
            }
          }
        } catch (_) { }
      }
    }

    // Session validation or refresh failed -> fail closed to logged-out state
    await clearTokens();
    setAuthToken(null);
    return { authenticated: false, user: null, onboardingComplete: false };
  } catch {
    await clearTokens();
    setAuthToken(null);
    return { authenticated: false, user: null, onboardingComplete: false };
  }
};
