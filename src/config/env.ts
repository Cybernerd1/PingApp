/**
 * Application Environment Configuration
 *
 * NOTE: React Native Metro does NOT natively inject .env variables into JS bundles.
 * Without react-native-dotenv (babel plugin), process.env.* is always undefined at runtime.
 * Values are therefore hardcoded here from the verified firebase/google-services credentials.
 *
 * GOOGLE_WEB_CLIENT_ID: Must be the Web Client (type 3) from google-services.json, NOT the
 * Android client (type 1). Used by GoogleSignin.configure() to obtain the ID token.
 * The backend's GOOGLE_CLIENT_ID env var MUST be this same value, otherwise
 * POST /api/v1/auth/google/callback rejects the token (audience mismatch).
 */

const BACKEND_URL = 'https://pingbackend-qcqv.onrender.com';

export const ENV = {
  BACKEND_URL,
  /** Legacy (un-versioned) routes — still used by not-yet-migrated screens. */
  API_URL: `${BACKEND_URL}/api`,
  /** Spec-compliant v1 routes — used by src/api/*. */
  API_V1_URL: `${BACKEND_URL}/api/v1`,
  // Web Client ID (client_type: 3) from android/app/google-services.json
  GOOGLE_WEB_CLIENT_ID: '510915224906-7vqraihhfncm56e2jdihtq1g7tiau5so.apps.googleusercontent.com',
};

export default ENV;
