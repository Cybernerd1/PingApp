import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiLogger } from './logger';

// Default backend API URL (Use 10.0.2.2 for Android emulator, localhost for iOS simulator)
export const BASE_URL = 'http://10.0.2.2:5000/api';

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
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

// Request Interceptor: Attach Auth Token & Log Request
apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const requestId = `req_${++requestIdCounter}_${Math.random().toString(36).substring(2, 6)}`;
    const startTime = Date.now();

    config._meta = { requestId, startTime };

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

    // Log API error
    ApiLogger.logError(meta.requestId, error, durationMs);

    return Promise.reject(error);
  }
);

export default apiClient;
