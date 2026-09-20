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
  console.log('🔧 [GoogleSignin] Configuring with webClientId:', ENV.GOOGLE_WEB_CLIENT_ID);
  try {
    GoogleSignin.configure({
      webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
    console.log('✅ [GoogleSignin] Configuration complete');
  } catch (err) {
    console.error('❌ [GoogleSignin] Configuration failed:', err);
    throw err;
  }
};

export interface AuthResult {
  user: any;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  onboardingComplete: boolean;
}

/**
 * Perform Native Google Sign-In + Firebase Auth Credential Exchange + Backend Verification
 * Throws on any error — no mock fallback data.
 */
export const signInWithGoogle = async (): Promise<AuthResult> => {
  console.log('\n🚀 ─────────────────────────────────────────');
  console.log('🚀 [signInWithGoogle] STARTED');
  console.log('🚀 Platform:', Platform.OS);
  console.log('🚀 webClientId:', ENV.GOOGLE_WEB_CLIENT_ID);

  configureGoogleSignIn();

  // Ensure Google Play Services are available on Android
  if (Platform.OS === 'android') {
    console.log('📱 [step 1] Checking Google Play Services availability...');
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log('✅ [step 1] Play Services OK');
  }

  // Trigger Native Google Account Picker
  console.log('📱 [step 2] Calling GoogleSignin.signIn() — account picker should appear...');
  let response: any;
  try {
    response = await GoogleSignin.signIn();
  } catch (err: any) {
    console.error('❌ [step 2] GoogleSignin.signIn() threw:', err?.code, err?.message, err);
    throw err;
  }
  console.log('✅ [step 2] GoogleSignin.signIn() returned:', JSON.stringify({
    type: response?.type,
    hasData: !!response?.data,
    hasIdToken: !!response?.data?.idToken,
    user: response?.data?.user ? {
      email: response.data.user.email,
      name: response.data.user.name,
      id: response.data.user.id,
    } : null,
  }, null, 2));

  const idToken = response.data?.idToken;
  if (!idToken) {
    console.error('❌ [step 2] No ID token in GoogleSignin response. Full response:', JSON.stringify(response, null, 2));
    throw new Error('Google Sign-In failed: No ID Token received from Google.');
  }
  console.log('✅ [step 2] Google ID Token obtained (first 30 chars):', idToken.substring(0, 30) + '...');

  // Exchange Google ID Token for Firebase Auth Credential
  console.log('🔥 [step 3] Creating Firebase GoogleAuthProvider credential...');
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  console.log('🔥 [step 3] Calling auth().signInWithCredential()...');
  let userCredential: any;
  try {
    userCredential = await auth().signInWithCredential(googleCredential);
  } catch (err: any) {
    console.error('❌ [step 3] Firebase signInWithCredential failed:', err?.code, err?.message, err);
    throw err;
  }
  console.log('✅ [step 3] Firebase sign-in success. User UID:', userCredential.user.uid);
  console.log('   email:', userCredential.user.email);
  console.log('   displayName:', userCredential.user.displayName);

  // Obtain Firebase ID Token
  console.log('🔥 [step 4] Getting Firebase ID Token via getIdToken(true)...');
  let firebaseIdToken: string;
  try {
    firebaseIdToken = await userCredential.user.getIdToken(true);
  } catch (err: any) {
    console.error('❌ [step 4] getIdToken() failed:', err?.code, err?.message, err);
    throw err;
  }
  console.log('✅ [step 4] Firebase ID Token obtained (first 30 chars):', firebaseIdToken.substring(0, 30) + '...');

  const deviceId = await DeviceInfo.getUniqueId();
  console.log('📱 [step 4] Device ID:', deviceId);

  // Send to backend POST /auth/verify
  console.log('📡 [step 5] POSTing to /auth/verify...');
  console.log('   Body:', JSON.stringify({ firebaseIdToken: firebaseIdToken.substring(0, 30) + '...', deviceId }, null, 2));
  let res: any;
  try {
    res = await apiClient.post('/auth/verify', {
      firebaseIdToken,
      deviceId,
    });
  } catch (err: any) {
    console.error('❌ [step 5] /auth/verify request failed:', err?.response?.status, err?.response?.data, err?.message);
    throw err;
  }
  console.log('✅ [step 5] /auth/verify response status:', res.status);
  console.log('   Response data:', JSON.stringify(res.data, null, 2));

  const authData = res.data?.data;
  const accessToken = authData?.accessToken;
  const refreshToken = authData?.refreshToken;

  if (!accessToken || !refreshToken) {
    console.error('❌ [step 5] Missing tokens in response. authData:', JSON.stringify(authData, null, 2));
    throw new Error('Authentication failed: Server response is missing access token or refresh token.');
  }
  console.log('✅ [step 5] Access & Refresh tokens received.');

  const isNewUser: boolean = authData?.isNewUser ?? false;
  // Normalize: backend returns onboardingCompleted (with 'd'), expose as onboardingComplete
  const onboardingComplete: boolean = !!(authData?.user?.onboardingCompleted ?? false);

  const user = authData?.user || {
    id: userCredential.user.uid,
    email: userCredential.user.email,
    username: userCredential.user.displayName || 'PingUser',
    avatar: userCredential.user.photoURL,
    onboardingCompleted: false,
  };
  console.log('👤 [step 6] User object:', JSON.stringify(user, null, 2));
  console.log('👤 [step 6] isNewUser:', isNewUser, '| onboardingComplete:', onboardingComplete);

  // Store tokens in Keychain & update Axios headers
  console.log('💾 [step 6] Saving tokens to Keychain...');
  const saved = await saveTokens(accessToken, refreshToken);
  if (!saved) {
    console.error('❌ [step 6] saveTokens() returned false');
    throw new Error('Failed to save session. Please try signing in again.');
  }
  setAuthToken(accessToken);
  console.log('✅ [step 6] Tokens saved, auth header set.');
  console.log('🎉 [signInWithGoogle] COMPLETE — user authenticated successfully!');
  console.log('🚀 ─────────────────────────────────────────\n');

  return {
    user,
    accessToken,
    refreshToken,
    isNewUser,
    onboardingComplete,
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
      // Validate session with backend GET /auth/me
      const res = await apiClient.get('/auth/me');
      const user = res.data?.data?.user;

      if (user) {
        return {
          authenticated: true,
          user,
          onboardingComplete: !!user.onboardingCompleted,
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

            const meRes = await apiClient.get('/auth/me');
            const meUser = meRes.data?.data?.user;
            if (meUser) {
              return {
                authenticated: true,
                user: meUser,
                onboardingComplete: !!meUser.onboardingCompleted,
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
