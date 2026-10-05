import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { tokenStore } from '../session/tokenStore';
import {
  SignupRequest,
  VerifyOtpRequest,
  AuthTokenData,
  isApiError,
} from '../api/types';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [profileExists, setProfileExists] = useState<boolean>(false);
  const [activeUsername, setActiveUsername] = useState<string>('');
  const [authSession, setAuthSession] = useState<string | undefined>(undefined);

  // Initial session check
  const checkAuthStatus = useCallback(async () => {
    try {
      const hasToken = await tokenStore.hydrate();
      setIsAuthenticated(hasToken);
    } catch {
      setIsAuthenticated(false);
      setProfileExists(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const saveAuthSession = async (data: AuthTokenData) => {
    await tokenStore.set(data.access_token, data.refresh_token);
    setIsAuthenticated(true);
    if (data.profile_exists !== undefined) {
      setProfileExists(data.profile_exists);
    }
  };

  // Mutations
  const signupMutation = useMutation({
    mutationFn: (payload: SignupRequest) => authApi.signup(payload),
    onSuccess: (_, variables) => {
      setActiveUsername(variables.username);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (payload: VerifyOtpRequest) => authApi.verifyOtp(payload),
    onSuccess: async res => {
      if (!isApiError(res) && res.data) {
        await saveAuthSession(res.data);
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: (payload: SignupRequest) => authApi.login(payload),
    onSuccess: (_, variables) => {
      setActiveUsername(variables.username);
    },
  });

  const loginVerifyOtpMutation = useMutation({
    mutationFn: (payload: VerifyOtpRequest) => authApi.loginVerifyOtp(payload),
    onSuccess: async res => {
      if (!isApiError(res) && res.data) {
        await saveAuthSession(res.data);
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      await tokenStore.clear();
      setIsAuthenticated(false);
      setProfileExists(false);
    },
  });

  return {
    isAuthenticated,
    profileExists,
    activeUsername,
    authSession,
    setAuthSession,
    signup: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    signupError: signupMutation.data && isApiError(signupMutation.data) ? signupMutation.data : null,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    verifyOtpError: verifyOtpMutation.data && isApiError(verifyOtpMutation.data) ? verifyOtpMutation.data : null,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.data && isApiError(loginMutation.data) ? loginMutation.data : null,
    loginVerifyOtp: loginVerifyOtpMutation.mutateAsync,
    isVerifyingLoginOtp: loginVerifyOtpMutation.isPending,
    loginVerifyOtpError: loginVerifyOtpMutation.data && isApiError(loginVerifyOtpMutation.data) ? loginVerifyOtpMutation.data : null,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
