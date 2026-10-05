import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interestsApi } from '../api/interests';
import { SaveInterestsRequest, isApiError } from '../api/types';

export function useInterests() {
  const queryClient = useQueryClient();

  const allInterestsQuery = useQuery({
    queryKey: ['masterInterests'],
    queryFn: async () => {
      const res = await interestsApi.getAllInterests();
      if (isApiError(res)) throw new Error(res.message);
      return res.data?.interests || [];
    },
  });

  const userInterestsQuery = useQuery({
    queryKey: ['userInterests'],
    queryFn: async () => {
      const res = await interestsApi.getUserInterests();
      if (isApiError(res)) throw new Error(res.message);
      return res.data?.interests || [];
    },
  });

  const saveInterestsMutation = useMutation({
    mutationFn: (payload: SaveInterestsRequest) => interestsApi.saveInterests(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInterests'] });
    },
  });

  const updateInterestsMutation = useMutation({
    mutationFn: (payload: SaveInterestsRequest) => interestsApi.updateInterests(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInterests'] });
    },
  });

  return {
    allInterests: allInterestsQuery.data || [],
    isLoadingAllInterests: allInterestsQuery.isLoading,
    userInterests: userInterestsQuery.data || [],
    isLoadingUserInterests: userInterestsQuery.isLoading,
    saveInterests: saveInterestsMutation.mutateAsync,
    isSavingInterests: saveInterestsMutation.isPending,
    updateInterests: updateInterestsMutation.mutateAsync,
    isUpdatingInterests: updateInterestsMutation.isPending,
  };
}
