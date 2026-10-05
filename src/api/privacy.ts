import { apiRequest } from './client';
import { ApiResponse, PrivacySettings } from './types';

export const privacyApi = {
  createPrivacySettings: async (
    payload: PrivacySettings
  ): Promise<ApiResponse<PrivacySettings>> => {
    return apiRequest<PrivacySettings>({
      method: 'POST',
      url: '/users/privacy/settings',
      data: payload,
    });
  },

  getPrivacySettings: async (): Promise<ApiResponse<PrivacySettings>> => {
    return apiRequest<PrivacySettings>({
      method: 'GET',
      url: '/users/privacy/settings',
    });
  },

  updatePrivacySettings: async (
    payload: Partial<PrivacySettings>
  ): Promise<ApiResponse<PrivacySettings>> => {
    return apiRequest<PrivacySettings>({
      method: 'PUT',
      url: '/users/privacy/settings',
      data: payload,
    });
  },
};
