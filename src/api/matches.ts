import { apiRequest } from './client';
import { ApiResponse, MatchItem } from './types';

export const matchesApi = {
  getMatches: async (): Promise<ApiResponse<{ matches: MatchItem[] }>> => {
    return apiRequest<{ matches: MatchItem[] }>({
      method: 'GET',
      url: '/matches',
    });
  },

  unmatch: async (
    matchId: string
  ): Promise<ApiResponse<{ unmatched: boolean }>> => {
    return apiRequest<{ unmatched: boolean }>({
      method: 'DELETE',
      url: `/matches/${matchId}`,
    });
  },
};
