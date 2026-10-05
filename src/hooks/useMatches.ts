import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchesApi } from '../api/matches';
import { isApiError } from '../api/types';

export function useMatches() {
  const queryClient = useQueryClient();

  const matchesQuery = useQuery({
    queryKey: ['userMatches'],
    queryFn: async () => {
      const res = await matchesApi.getMatches();
      if (isApiError(res)) throw new Error(res.message);
      return res.data?.matches || [];
    },
  });

  const unmatchMutation = useMutation({
    mutationFn: (matchId: string) => matchesApi.unmatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMatches'] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    },
  });

  return {
    matches: matchesQuery.data || [],
    isLoadingMatches: matchesQuery.isLoading,
    matchesError: matchesQuery.error,
    unmatch: unmatchMutation.mutateAsync,
    isUnmatching: unmatchMutation.isPending,
    refetchMatches: matchesQuery.refetch,
  };
}
