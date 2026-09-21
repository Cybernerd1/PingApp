import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiLogger } from './logger';
import { ENV } from '../config/env';

// Backend API URL from environment configuration
export const BASE_URL = ENV.API_URL;

/**
 * Per-endpoint timeout overrides (ms).
 * The backend runs on Render free tier — cold-starts take 30-60s.
 * Auth endpoints are always the first hit after a cold-start, so they get a longer timeout.
 */
const ENDPOINT_TIMEOUTS: Record<string, number> = {
  '/auth/verify': 60_000,        // Render cold-start: up to 60s on first wakeup
  '/auth/refresh': 30_000,
  '/discovery/stack': 60_000,    // First request after cold-start can take 30-60s
};

// Default timeout for all other requests (30s — generous for a mobile app)
const DEFAULT_TIMEOUT_MS = 30_000;

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let authToken: string | null = null;
let requestIdCounter = 0;

// Token management helpers
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

// Extend Axios Internal Request Config with custom metadata
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _meta?: {
    requestId: string;
    startTime: number;
  };
}

// Request Interceptor: Attach Auth Token, apply per-endpoint timeout & Log Request
apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const requestId = `req_${++requestIdCounter}_${Math.random().toString(36).substring(2, 6)}`;
    const startTime = Date.now();

    config._meta = { requestId, startTime };

    // Apply per-endpoint timeout override if defined
    const urlPath = config.url || '';
    const overrideTimeout = ENDPOINT_TIMEOUTS[urlPath];
    if (overrideTimeout) {
      config.timeout = overrideTimeout;
      console.log(`⏱️  [apiClient] Timeout override for ${urlPath}: ${overrideTimeout / 1000}s (Render cold-start)`);
    }

    if (authToken && config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    // Log the request
    ApiLogger.logRequest({
      id: requestId,
      method: config.method,
      url: `${config.baseURL || ''}${config.url || ''}`,
      headers: config.headers ? (config.headers as any) : undefined,
      data: config.data,
      params: config.params,
      startTime,
    });

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Setup Error:', error.message);
    return Promise.reject(error);
  }
);

// Response Interceptor: Log Response & Handle Token Expiry
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as CustomAxiosRequestConfig;
    const meta = config._meta || { requestId: 'unknown', startTime: Date.now() };
    const durationMs = Date.now() - meta.startTime;

    // Log successful response
    ApiLogger.logResponse({
      id: meta.requestId,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers ? (response.headers as any) : undefined,
      durationMs,
    });

    return response;
  },
  (error: AxiosError) => {
    const config = error.config as CustomAxiosRequestConfig | undefined;
    const meta = config?._meta || { requestId: 'unknown', startTime: Date.now() };
    const durationMs = Date.now() - meta.startTime;
    const urlPath = config?.url || '';
    const status = (error.response?.status ?? 0);

    // Silently suppress expected 404s on discovery endpoints — the app
    // already falls back to mock/dummy data and these logs are pure noise.
    const isExpected404 = status === 404 && urlPath.startsWith('/discovery/');
    if (isExpected404) {
      return Promise.reject(error);
    }

    // Provide clearer diagnosis for common network failures
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error(
        `⏱️  [apiClient] REQUEST TIMED OUT after ${durationMs}ms for ${urlPath}.`,
        'The backend (Render free tier) may still be cold-starting — try again in 10s.',
      );
    } else if (!error.response) {
      console.error(
        `📡 [apiClient] NO RESPONSE received for ${urlPath} (${durationMs}ms).`,
        'Error code:', error.code,
        '— Check device internet connection or backend reachability.',
      );
    }

    // Log API error
    ApiLogger.logError(meta.requestId, error, durationMs);

    return Promise.reject(error);
  }
);

export default apiClient;
