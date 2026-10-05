import { apiRequest } from './client';
import { ApiResponse, LocationCoordinates } from './types';

export const locationApi = {
  startLocationSharing: async (
    payload: LocationCoordinates
  ): Promise<ApiResponse<{ sharing: boolean }>> => {
    return apiRequest<{ sharing: boolean }>({
      method: 'POST',
      url: '/users/location/start',
      data: payload,
    });
  },

  stopLocationSharing: async (): Promise<ApiResponse<{ sharing: boolean }>> => {
    return apiRequest<{ sharing: boolean }>({
      method: 'POST',
      url: '/users/location/stop',
    });
  },
};
