import { apiRequest } from './client';
import { ApiResponse, ProfileDataExport } from './types';

export const accountApi = {
  deleteProfile: async (): Promise<ApiResponse<{ deleted: boolean }>> => {
    return apiRequest<{ deleted: boolean }>({
      method: 'DELETE',
      url: '/users/profile',
    });
  },

  deleteAccount: async (): Promise<ApiResponse<{ deleted: boolean }>> => {
    return apiRequest<{ deleted: boolean }>({
      method: 'DELETE',
      url: '/users/account',
    });
  },

  exportUserData: async (): Promise<ApiResponse<ProfileDataExport>> => {
    return apiRequest<ProfileDataExport>({
      method: 'GET',
      url: '/users/profile/export',
    });
  },
};
