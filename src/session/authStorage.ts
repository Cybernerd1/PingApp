/**
 * Secure Token Storage Service
 * Uses react-native-keychain for storing backend access & refresh tokens
 */

import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'com.ping.auth.tokens';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Save access and refresh tokens to secure Keychain
 */
export const saveTokens = async (accessToken: string, refreshToken: string): Promise<boolean> => {
  try {
    const payload = JSON.stringify({ accessToken, refreshToken });
    await Keychain.setGenericPassword('ping_user_session', payload, {
      service: KEYCHAIN_SERVICE,
    });
    return true;
  } catch (error) {
    console.error('❌ [Keychain Error] Failed to save tokens:', error);
    return false;
  }
};

/**
 * Retrieve access and refresh tokens from secure Keychain
 */
export const getTokens = async (): Promise<AuthTokens | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (credentials && credentials.password) {
      const parsed: AuthTokens = JSON.parse(credentials.password);
      if (parsed.accessToken && parsed.refreshToken) {
        return parsed;
      }
    }
    return null;
  } catch (error) {
    console.error('❌ [Keychain Error] Failed to retrieve tokens:', error);
    return null;
  }
};

/**
 * Clear stored tokens from Keychain on logout
 */
export const clearTokens = async (): Promise<boolean> => {
  try {
    await Keychain.resetGenericPassword({
      service: KEYCHAIN_SERVICE,
    });
    return true;
  } catch (error) {
    console.error('❌ [Keychain Error] Failed to clear tokens:', error);
    return false;
  }
};
