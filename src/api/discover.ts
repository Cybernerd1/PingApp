import { apiRequest } from './client';
import { ApiResponse, DiscoverCandidate } from './types';

export const discoverApi = {
  getDiscoverStack: async (
    limit: number = 20
  ): Promise<ApiResponse<{ users: DiscoverCandidate[] }>> => {
    return apiRequest<{ users: DiscoverCandidate[] }>({
      method: 'GET',
      url: `/discover?limit=${limit}`,
    });
  },
};
