import { apiRequest } from './client';
import { ProfileDataExport } from './types';
import { purgeCache } from '../cache/purge';

export const accountApi = {
  /** Soft-delete: hides the dating profile; signing in again restores it. */
  deleteProfile: async () => {
    const res = await apiRequest<{ deleted: boolean }>({ method: 'DELETE', url: '/users/profile' });
    if (res.status === 'success') await purgeCache();
    return res;
  },

  /** Permanent. The backend requires the user's own id as confirmation. */
  deleteAccount: async (userId: string) => {
    const res = await apiRequest<{ deleted: boolean }>({ method: 'DELETE', url: '/users/account', data: { confirm: userId } });
    if (res.status === 'success') await purgeCache();
    return res;
  },

  exportUserData: () => apiRequest<ProfileDataExport>({ method: 'GET', url: '/users/profile/export' }),
};
