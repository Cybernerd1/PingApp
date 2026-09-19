/**
 * Application Environment Configuration
 * Reads credentials from .env with fallback to production backend API
 */

declare const process: {
  env: Record<string, string | undefined>;
};

export const ENV = {
  API_URL: process.env.API_URL || 'https://pingbackend-qcqv.onrender.com/api',
  BACKEND_URL: process.env.BACKEND_URL || 'https://pingbackend-qcqv.onrender.com',
  GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID || '1084920492842-ping-app.apps.googleusercontent.com',
};

export default ENV;
