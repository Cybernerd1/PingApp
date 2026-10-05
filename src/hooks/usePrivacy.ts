import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { privacyApi } from '../api/privacy';
import { PrivacySettings, isApiError } from '../api/types';

export function usePrivacy() {
  const queryClient = useQueryClient();

  const privacyQuery = useQuery({
    queryKey: ['privacySettings'],
    queryFn: async () => {
      const res = await privacyApi.getPrivacySettings();
      if (isApiError(res)) throw new Error(res.message);
      return res.data;
    },
  });

  const createPrivacyMutation = useMutation({
    mutationFn: (payload: PrivacySettings) => privacyApi.createPrivacySettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacySettings'] });
    },
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: (payload: Partial<PrivacySettings>) => privacyApi.updatePrivacySettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacySettings'] });
    },
  });

  return {
    privacySettings: privacyQuery.data,
    isLoadingPrivacy: privacyQuery.isLoading,
    createPrivacySettings: createPrivacyMutation.mutateAsync,
    isCreatingPrivacy: createPrivacyMutation.isPending,
    updatePrivacySettings: updatePrivacyMutation.mutateAsync,
    isUpdatingPrivacy: updatePrivacyMutation.isPending,
  };
}
