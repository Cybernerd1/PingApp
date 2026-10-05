import { apiRequest } from './client';
import {
  ApiResponse,
  SignupRequest,
  VerifyOtpRequest,
  AuthTokenData,
  GoogleAuthRequest,
  AppleAuthRequest,
} from './types';

export const authApi = {
  // Signup
  signup: async (payload: SignupRequest): Promise<ApiResponse<{}>> => {
    return apiRequest<{}>({
      method: 'POST',
      url: '/auth/signup',
      data: payload,
    });
  },

  verifyOtp: async (
    payload: VerifyOtpRequest
  ): Promise<ApiResponse<AuthTokenData>> => {
    return apiRequest<AuthTokenData>({
      method: 'POST',
      url: '/auth/verify-otp',
      data: payload,
    });
  },

  resendOtp: async (username: string): Promise<ApiResponse<{}>> => {
    return apiRequest<{}>({
      method: 'POST',
      url: '/auth/resend-otp',
      data: { username },
    });
  },

  // Login
  login: async (payload: SignupRequest): Promise<ApiResponse<{}>> => {
    return apiRequest<{}>({
      method: 'POST',
      url: '/auth/login',
      data: payload,
    });
  },

  loginVerifyOtp: async (
    payload: VerifyOtpRequest
  ): Promise<ApiResponse<AuthTokenData>> => {
    return apiRequest<AuthTokenData>({
      method: 'POST',
      url: '/auth/login/verify-otp',
      data: payload,
    });
  },

  loginResendOtp: async (
    username: string,
    session?: string
  ): Promise<ApiResponse<{}>> => {
    return apiRequest<{}>({
      method: 'POST',
      url: '/auth/login/resend-otp',
      data: { username, session },
    });
  },

  // OAuth
  googleCallback: async (
    payload: GoogleAuthRequest
  ): Promise<ApiResponse<AuthTokenData>> => {
    return apiRequest<AuthTokenData>({
      method: 'POST',
      url: '/auth/google/callback',
      data: payload,
    });
  },

  appleCallback: async (
    payload: AppleAuthRequest
  ): Promise<ApiResponse<AuthTokenData>> => {
    return apiRequest<AuthTokenData>({
      method: 'POST',
      url: '/auth/apple/callback',
      data: payload,
    });
  },

  // Refresh & Logout
  refreshToken: async (
    refreshToken: string
  ): Promise<ApiResponse<{ access_token: string; refresh_token?: string; expires_in: number }>> => {
    return apiRequest<{ access_token: string; refresh_token?: string; expires_in: number }>({
      method: 'POST',
      url: '/auth/refresh-token',
      data: { refresh_token: refreshToken },
    });
  },

  logout: async (): Promise<ApiResponse<{}>> => {
    return apiRequest<{}>({
      method: 'POST',
      url: '/auth/logout',
    });
  },
};
