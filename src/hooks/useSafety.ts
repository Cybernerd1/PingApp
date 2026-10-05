import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { safetyApi } from '../api/safety';
import { ReportUserRequest, isApiError } from '../api/types';

export function useSafety() {
  const queryClient = useQueryClient();

  const blockedUsersQuery = useQuery({
    queryKey: ['blockedUsers'],
    queryFn: async () => {
      const res = await safetyApi.getBlockedUsers();
      if (isApiError(res)) throw new Error(res.message);
      return res.data?.blocked_users || [];
    },
  });

  const reportUserMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: ReportUserRequest }) =>
      safetyApi.reportUser(userId, payload),
  });

  const blockUserMutation = useMutation({
    mutationFn: (userId: string) => safetyApi.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userMatches'] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
      queryClient.invalidateQueries({ queryKey: ['discoverStack'] });
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: (userId: string) => safetyApi.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
    },
  });

  return {
    blockedUsers: blockedUsersQuery.data || [],
    isLoadingBlockedUsers: blockedUsersQuery.isLoading,
    reportUser: reportUserMutation.mutateAsync,
    isReporting: reportUserMutation.isPending,
    blockUser: blockUserMutation.mutateAsync,
    isBlocking: blockUserMutation.isPending,
    unblockUser: unblockUserMutation.mutateAsync,
    isUnblocking: unblockUserMutation.isPending,
  };
}
