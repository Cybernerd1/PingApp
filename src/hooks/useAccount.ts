import { useMutation } from '@tanstack/react-query';
import { accountApi } from '../api/account';

export function useAccount() {
  const exportDataMutation = useMutation({
    mutationFn: () => accountApi.exportUserData(),
  });

  const deleteProfileMutation = useMutation({
    mutationFn: () => accountApi.deleteProfile(),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => accountApi.deleteAccount(),
  });

  return {
    exportUserData: exportDataMutation.mutateAsync,
    isExporting: exportDataMutation.isPending,
    exportData: exportDataMutation.data,
    deleteProfile: deleteProfileMutation.mutateAsync,
    isDeletingProfile: deleteProfileMutation.isPending,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeletingAccount: deleteAccountMutation.isPending,
  };
}
