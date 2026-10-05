import { apiRequest } from './client';
import { ApiResponse, DatingPreferences } from './types';

export const preferencesApi = {
  savePreferences: async (
    payload: DatingPreferences
  ): Promise<ApiResponse<{ preferences: DatingPreferences }>> => {
    return apiRequest<{ preferences: DatingPreferences }>({
      method: 'POST',
      url: '/users/preferences',
      data: payload,
    });
  },

  getPreferences: async (): Promise<ApiResponse<DatingPreferences>> => {
    return apiRequest<DatingPreferences>({
      method: 'GET',
      url: '/users/preferences',
    });
  },

  updatePreferences: async (
    payload: Partial<DatingPreferences>
  ): Promise<ApiResponse<{ preferences: DatingPreferences }>> => {
    return apiRequest<{ preferences: DatingPreferences }>({
      method: 'PUT',
      url: '/users/preferences',
      data: payload,
    });
  },
};
