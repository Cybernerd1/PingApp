/**
 * Session orchestration for the v1 API.
 *
 *  signInWithGoogle()  → Google account picker → POST /auth/google/callback → tokens → resolveSession()
 *  resolveSession()    → GET /users/profile (+ /users/preferences) → where should the user land?
 *  signOut()           → POST /auth/logout → clear Keychain + Google session
 *
 * Onboarding progress is derived from data, not from `profile_exists`, because the
 * backend pre-fills full_name from Google (so profile_exists is true even for a
 * user who never finished onboarding) and v1 never sets onboarding_completed.
 */
import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ENV } from '../config/env';
import { authApi } from '../api/auth';
import { profileApi } from '../api/profile';
import { preferencesApi } from '../api/preferences';
import { UserProfile } from '../api/types';
import { tokenStore } from './tokenStore';
import { devicesApi } from '../api/devices';
import { getFCMToken } from '../native/fcm';

export type OnboardingStep = 'gender' | 'basics' | 'interests' | 'photos' | 'preferences';

export const ONBOARDING_ORDER: OnboardingStep[] = ['gender', 'basics', 'interests', 'photos', 'preferences'];

export interface GoogleIdentity {
  email?: string | null;
  name?: string | null;
  photo?: string | null;
}

export type SessionState =
  | { status: 'signedOut' }
  | { status: 'onboarding'; step: OnboardingStep; profile: UserProfile | null; identity: GoogleIdentity | null }
  | { status: 'ready'; profile: UserProfile; identity: GoogleIdentity | null }
  /** Server unreachable (cold start / offline) but we do hold tokens. */
  | { status: 'offline'; message: string };

let identity: GoogleIdentity | null = null;
let configured = false;

function configureGoogle() {
  if (configured) return;
  GoogleSignin.configure({ webClientId: ENV.GOOGLE_WEB_CLIENT_ID, offlineAccess: false });
  configured = true;
}

export class SignInCancelled extends Error {
  constructor() {
    super('Sign-in cancelled');
  }
}

/** Google → v1 backend. Throws SignInCancelled if the user closes the picker. */
export async function signInWithGoogle(): Promise<SessionState> {
  configureGoogle();
  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  let response: any;
  try {
    response = await GoogleSignin.signIn();
  } catch (err: any) {
    if (err?.code === 'SIGN_IN_CANCELLED' || err?.code === '12501') throw new SignInCancelled();
    throw err;
  }
  if (response?.type === 'cancelled') throw new SignInCancelled();

  const idToken: string | undefined = response?.data?.idToken;
  if (!idToken) throw new Error('Google did not return an ID token. Check GOOGLE_WEB_CLIENT_ID.');

  const user = response?.data?.user;
  identity = { email: user?.email, name: user?.name, photo: user?.photo };

  const res = await authApi.googleCallback({ id_token: idToken });
  if (res.status === 'error') {
    await GoogleSignin.signOut().catch(() => {});
    if (res.httpStatus === 404) {
      // The deployed server predates the v1 API (e.g. Render still on an old branch).
      throw new Error('Ping’s server is out of date — deploy the latest backend (with /api/v1) and try again.');
    }
    if (res.code === 'UNAUTHORIZED') {
      throw new Error('Google sign-in was rejected by the server. Check GOOGLE_CLIENT_ID on the backend matches the app’s web client ID.');
    }
    throw new Error(res.message);
  }

  await tokenStore.set(res.data.access_token, res.data.refresh_token);
  return resolveSession();
}

/** Demo / test account login: POST /auth/login/password. */
export const DEMO_CREDENTIALS = { email: 'demo@ping.app', password: 'Demo@1234' } as const;

export async function signInWithPassword(email: string, password: string): Promise<SessionState> {
  const res = await authApi.loginWithPassword({ email: email.trim(), password });
  if (res.status === 'error') {
    if (res.httpStatus === 404) {
      throw new Error('Ping’s server doesn’t support email sign-in yet — deploy the latest backend and run the migrations.');
    }
    if (res.code === 'UNAUTHORIZED') throw new Error('Incorrect email or password.');
    throw new Error(res.message);
  }
  identity = { email: email.trim().toLowerCase(), name: null, photo: null };
  await tokenStore.set(res.data.access_token, res.data.refresh_token);
  return resolveSession();
}

/** Work out where an authenticated user belongs. */
export async function resolveSession(): Promise<SessionState> {
  const hasToken = await tokenStore.hydrate();
  if (!hasToken) return { status: 'signedOut' };

  if (!identity) {
    try {
      configureGoogle();
      const current: any = GoogleSignin.getCurrentUser();
      const u = current?.user;
      if (u) identity = { email: u.email, name: u.name, photo: u.photo };
    } catch {
      // not signed in with Google on this device — fine
    }
  }

  const profileRes = await profileApi.getOwnProfile();
  if (profileRes.status === 'error') {
    if (profileRes.code === 'UNAUTHORIZED') {
      await tokenStore.clear();
      return { status: 'signedOut' };
    }
    if (profileRes.code === 'NOT_FOUND') {
      return { status: 'onboarding', step: 'gender', profile: null, identity };
    }
    return { status: 'offline', message: profileRes.message };
  }

  const profile = profileRes.data;
  const step = await deriveStep(profile);
  if (step) return { status: 'onboarding', step, profile, identity };
  return { status: 'ready', profile, identity };
}

async function deriveStep(p: UserProfile): Promise<OnboardingStep | null> {
  if (!p.gender) return 'gender';
  if (!p.birthdate || !p.full_name) return 'basics';
  if ((p.interests?.length ?? 0) < 3) return 'interests';
  if ((p.photos?.length ?? 0) < 1) return 'photos';
  const prefs = await preferencesApi.getPreferences();
  if (prefs.status === 'error' && prefs.code === 'NOT_FOUND') return 'preferences';
  return null;
}

export function getIdentity(): GoogleIdentity | null {
  return identity;
}

export async function signOut(): Promise<void> {
  // Stop pushes for this account on this phone (needs the token, so before logout).
  const pushToken = await getFCMToken().catch(() => null);
  if (pushToken) await devicesApi.unregister(pushToken).catch(() => undefined);
  await authApi.logout().catch(() => undefined);
  await tokenStore.clear();
  identity = null;
  try {
    configureGoogle();
    await GoogleSignin.signOut();
  } catch {
    // ignore
  }
}
