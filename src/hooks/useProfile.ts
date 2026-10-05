import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile';
import { CreateProfileRequest, UpdateProfileRequest, isApiError } from '../api/types';

export function useProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await profileApi.getOwnProfile();
      if (isApiError(res)) throw new Error(res.message);
      return res.data;
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: (payload: CreateProfileRequest) => profileApi.createProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfileRequest) => profileApi.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: () => profileApi.deleteProfile(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  return {
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    profileError: profileQuery.error,
    createProfile: createProfileMutation.mutateAsync,
    isCreatingProfile: createProfileMutation.isPending,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    deleteProfile: deleteProfileMutation.mutateAsync,
    isDeletingProfile: deleteProfileMutation.isPending,
  };
}
