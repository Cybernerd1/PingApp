import { apiRequest } from './client';
import {
  ApiResponse,
  CreateProfileRequest,
  UpdateProfileRequest,
  VerifyLoginInfoRequest,
  UserProfile,
  ProfileDataExport,
} from './types';

export const profileApi = {
  createProfile: async (
    payload: CreateProfileRequest
  ): Promise<ApiResponse<{ profile: UserProfile }>> => {
    return apiRequest<{ profile: UserProfile }>({
      method: 'POST',
      url: '/users/profile',
      data: payload,
    });
  },

  getOwnProfile: async (): Promise<ApiResponse<UserProfile>> => {
    return apiRequest<UserProfile>({
      method: 'GET',
      url: '/users/profile',
    });
  },

  updateProfile: async (
    payload: UpdateProfileRequest
  ): Promise<
    ApiResponse<{
      profile: UserProfile;
      verification_required: boolean;
      session: string | null;
    }>
  > => {
    return apiRequest({
      method: 'PUT',
      url: '/users/profile',
      data: payload,
    });
  },

  deleteProfile: async (): Promise<ApiResponse<{ deleted: boolean }>> => {
    return apiRequest<{ deleted: boolean }>({
      method: 'DELETE',
      url: '/users/profile',
    });
  },

  verifyLoginInfo: async (
    payload: VerifyLoginInfoRequest
  ): Promise<ApiResponse<{ profile: UserProfile }>> => {
    return apiRequest<{ profile: UserProfile }>({
      method: 'POST',
      url: '/users/profile/verify-login-info',
      data: payload,
    });
  },

  getUserProfileById: async (
    userId: string
  ): Promise<ApiResponse<UserProfile>> => {
    return apiRequest<UserProfile>({
      method: 'GET',
      url: `/users/profile/${userId}`,
    });
  },

  exportUserData: async (): Promise<ApiResponse<ProfileDataExport>> => {
    return apiRequest<ProfileDataExport>({
      method: 'GET',
      url: '/users/profile/export',
    });
  },
};
