import { useQuery, useQueryClient } from '@tanstack/react-query';
import { discoverApi } from '../api/discover';
import { isApiError, DiscoverCandidate } from '../api/types';

export function useDiscover(limit: number = 20) {
  const queryClient = useQueryClient();

  const discoverQuery = useQuery({
    queryKey: ['discoverStack', limit],
    queryFn: async () => {
      const res = await discoverApi.getDiscoverStack(limit);
      if (isApiError(res)) throw new Error(res.message);
      return res.data?.users || [];
    },
  });

  const refetchDiscover = () => {
    return queryClient.invalidateQueries({ queryKey: ['discoverStack'] });
  };

  return {
    candidates: discoverQuery.data || [],
    isLoadingCandidates: discoverQuery.isLoading,
    isRefetchingCandidates: discoverQuery.isRefetching,
    discoverError: discoverQuery.error,
    refetchDiscover,
  };
}
