import { apiRequest } from './client';
import { ApiResponse, ReportUserRequest, BlockedUserItem } from './types';

export const safetyApi = {
  reportUser: async (
    userId: string,
    payload: ReportUserRequest
  ): Promise<ApiResponse<{ report_id: string }>> => {
    return apiRequest<{ report_id: string }>({
      method: 'POST',
      url: `/users/${userId}/report`,
      data: payload,
    });
  },

  blockUser: async (
    userId: string
  ): Promise<ApiResponse<{ blocked: boolean }>> => {
    return apiRequest<{ blocked: boolean }>({
      method: 'POST',
      url: `/users/${userId}/block`,
    });
  },

  unblockUser: async (
    userId: string
  ): Promise<ApiResponse<{ unblocked: boolean }>> => {
    return apiRequest<{ unblocked: boolean }>({
      method: 'DELETE',
      url: `/users/${userId}/block`,
    });
  },

  getBlockedUsers: async (): Promise<ApiResponse<{ blocked_users: BlockedUserItem[] }>> => {
    return apiRequest<{ blocked_users: BlockedUserItem[] }>({
      method: 'GET',
      url: '/users/blocked',
    });
  },
};
