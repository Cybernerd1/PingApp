import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesApi } from '../api/preferences';
import { DatingPreferences, isApiError } from '../api/types';

export function usePreferences() {
  const queryClient = useQueryClient();

  const preferencesQuery = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const res = await preferencesApi.getPreferences();
      if (isApiError(res)) throw new Error(res.message);
      return res.data;
    },
  });

  const savePreferencesMutation = useMutation({
    mutationFn: (payload: DatingPreferences) => preferencesApi.savePreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (payload: Partial<DatingPreferences>) => preferencesApi.updatePreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    },
  });

  return {
    preferences: preferencesQuery.data,
    isLoadingPreferences: preferencesQuery.isLoading,
    savePreferences: savePreferencesMutation.mutateAsync,
    isSavingPreferences: savePreferencesMutation.isPending,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
  };
}
