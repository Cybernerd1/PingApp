import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';
import { tokenStore } from '../session/tokenStore';
import { ApiErrorEnvelope, ApiResponse } from './types';

export const API_BASE_URL = ENV.API_V1_URL;

/**
 * Render free tier cold-starts take 30–60 s; the first call after idle is
 * usually auth or the profile bootstrap, so those get a long timeout.
 */
const SLOW_PATHS = ['/auth/', '/users/profile'];
const DEFAULT_TIMEOUT = 30_000;
const SLOW_TIMEOUT = 60_000;

/** Kept for backwards compatibility with older imports; tokens now live in Keychain. */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ping_access_token',
  REFRESH_TOKEN: 'ping_refresh_token',
  USER_PROFILE: 'ping_user_profile',
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: DEFAULT_TIMEOUT,
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// ── Request: attach bearer + per-path timeout ────────────────────────────
apiClient.interceptors.request.use(config => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.url && SLOW_PATHS.some(p => config.url!.startsWith(p))) {
    config.timeout = SLOW_TIMEOUT;
  }
  // React Native: let the native layer set the multipart boundary.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
    config.transformRequest = d => d;
  }
  return config;
});

// ── Single-flight refresh (backend rotates BOTH tokens) ──────────────────
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;
  try {
    const res = await axios.post(
      `${API_BASE_URL}/auth/refresh-token`,
      { refresh_token: refresh },
      { timeout: SLOW_TIMEOUT },
    );
    const data = res.data?.data;
    if (data?.access_token) {
      await tokenStore.set(data.access_token, data.refresh_token ?? refresh);
      return data.access_token;
    }
  } catch {
    // fall through
  }
  return null;
}

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError<any>) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isAuthCall = original?.url?.startsWith('/auth/');

    if (status === 401 && original && !original._retry && !isAuthCall && tokenStore.getRefresh()) {
      original._retry = true;
      refreshPromise = refreshPromise ?? refreshAccessToken().finally(() => (refreshPromise = null));
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
      await tokenStore.clear();
      tokenStore.emitExpired();
    }

    // Normalise every failure into the spec's error envelope.
    const server = error.response?.data;
    const normalized: ApiErrorEnvelope = {
      status: 'error',
      code: server?.code || mapStatusCodeToErrorCode(status, error),
      message: server?.message || friendlyNetworkMessage(error),
      details: server?.details,
      httpStatus: status,
    };
    return Promise.resolve({ ...error.response, data: normalized });
  },
);

function friendlyNetworkMessage(error: AxiosError): string {
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Ping is waking up — please try again in a few seconds.';
  }
  if (!error.response) return 'No connection. Check your internet and try again.';
  return error.message || 'An unexpected error occurred';
}

function mapStatusCodeToErrorCode(status?: number, error?: AxiosError): ApiErrorEnvelope['code'] {
  if (!status && error && !error.response) return 'NETWORK_ERROR';
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'RATE_LIMIT_EXCEEDED';
    default:
      return 'INTERNAL_ERROR';
  }
}

/**
 * Standard request helper — never throws; always resolves to ApiResponse<T>.
 */
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const res = await apiClient.request<ApiResponse<T>>(config);
    return res.data;
  } catch (err: any) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: err?.message || 'Network error occurred',
    };
  }
}

/** Unwraps an ApiResponse or throws an ApiError — convenient for react-query queryFns. */
export class ApiError extends Error {
  code: ApiErrorEnvelope['code'];
  httpStatus?: number;
  details?: ApiErrorEnvelope['details'];
  constructor(env: ApiErrorEnvelope) {
    super(env.message);
    this.code = env.code;
    this.httpStatus = env.httpStatus;
    this.details = env.details;
  }
}

export function unwrap<T>(res: ApiResponse<T>): T {
  if (res.status === 'error') throw new ApiError(res);
  return res.data;
}
