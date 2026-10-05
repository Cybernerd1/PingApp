import { apiRequest } from './client';
import { ProfileDataExport } from './types';

export const accountApi = {
  /** Soft-delete: hides the dating profile; signing in again restores it. */
  deleteProfile: () => apiRequest<{ deleted: boolean }>({ method: 'DELETE', url: '/users/profile' }),

  /** Permanent. The backend requires the user's own id as confirmation. */
  deleteAccount: (userId: string) =>
    apiRequest<{ deleted: boolean }>({ method: 'DELETE', url: '/users/account', data: { confirm: userId } }),

  exportUserData: () => apiRequest<ProfileDataExport>({ method: 'GET', url: '/users/profile/export' }),
};
