import { apiRequest } from './client';
import { ApiResponse, MasterInterest, SaveInterestsRequest } from './types';

export const interestsApi = {
  getAllInterests: async (): Promise<ApiResponse<{ interests: MasterInterest[] }>> => {
    return apiRequest<{ interests: MasterInterest[] }>({
      method: 'GET',
      url: '/interests',
    });
  },

  saveInterests: async (
    payload: SaveInterestsRequest
  ): Promise<ApiResponse<{ interests: string[] }>> => {
    return apiRequest<{ interests: string[] }>({
      method: 'POST',
      url: '/users/interests',
      data: payload,
    });
  },

  updateInterests: async (
    payload: SaveInterestsRequest
  ): Promise<ApiResponse<{ interests: string[] }>> => {
    return apiRequest<{ interests: string[] }>({
      method: 'PUT',
      url: '/users/interests',
      data: payload,
    });
  },

  getUserInterests: async (): Promise<ApiResponse<{ interests: string[] }>> => {
    return apiRequest<{ interests: string[] }>({
      method: 'GET',
      url: '/users/interests',
    });
  },
};
