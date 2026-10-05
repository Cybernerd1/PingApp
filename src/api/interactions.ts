import { apiRequest } from './client';
import { ApiResponse, SwipeRequest, SwipeResponseData } from './types';

export const interactionsApi = {
  swipe: async (
    payload: SwipeRequest
  ): Promise<ApiResponse<SwipeResponseData>> => {
    return apiRequest<SwipeResponseData>({
      method: 'POST',
      url: '/interactions',
      data: payload,
    });
  },

  undoLike: async (
    targetUserId: string
  ): Promise<ApiResponse<{ removed: boolean }>> => {
    return apiRequest<{ removed: boolean }>({
      method: 'DELETE',
      url: `/interactions/likes/${targetUserId}`,
    });
  },

  undoDislike: async (
    targetUserId: string
  ): Promise<ApiResponse<{ removed: boolean }>> => {
    return apiRequest<{ removed: boolean }>({
      method: 'DELETE',
      url: `/interactions/dislikes/${targetUserId}`,
    });
  },
};
