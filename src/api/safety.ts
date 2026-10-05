import { apiRequest } from './client';
import { ApiResponse, ReportUserRequest, BlockedUserItem } from './types';

export const safetyApi = {
  reportUser: (userId: string, payload: ReportUserRequest) =>
    apiRequest<{ report_id: string }>({ method: 'POST', url: `/users/${userId}/report`, data: payload }),

  blockUser: (userId: string) =>
    apiRequest<{ blocked_user_id: string }>({ method: 'POST', url: `/users/${userId}/block` }),

  unblockUser: (userId: string) =>
    apiRequest<{ unblocked_user_id: string }>({ method: 'DELETE', url: `/users/${userId}/block` }),

  getBlockedUsers: (): Promise<ApiResponse<{ users: BlockedUserItem[] }>> =>
    apiRequest<{ users: BlockedUserItem[] }>({ method: 'GET', url: '/users/blocked' }),
};
