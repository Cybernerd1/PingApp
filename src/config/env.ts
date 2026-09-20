/**
 * Application Environment Configuration
 *
 * NOTE: React Native Metro does NOT natively inject .env variables into JS bundles.
 * Without react-native-dotenv (babel plugin), process.env.* is always undefined at runtime.
 * Values are therefore hardcoded here from the verified firebase/google-services credentials.
 *
 * GOOGLE_WEB_CLIENT_ID: Must be the Web Client (type 3) from google-services.json, NOT the
 * Android client (type 1). Used by GoogleSignin.configure() to obtain the ID token for Firebase.
 */

export const ENV = {
  API_URL: 'https://pingbackend-qcqv.onrender.com/api',
  BACKEND_URL: 'https://pingbackend-qcqv.onrender.com',
  // Web Client ID (client_type: 3) from android/app/google-services.json
  GOOGLE_WEB_CLIENT_ID: '510915224906-7vqraihhfncm56e2jdihtq1g7tiau5so.apps.googleusercontent.com',
};

export default ENV;
