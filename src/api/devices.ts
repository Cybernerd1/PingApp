import { Platform } from 'react-native';
import { apiRequest } from './client';

export const devicesApi = {
  register: (token: string) =>
    apiRequest<{ registered: boolean }>({ method: 'POST', url: '/users/devices', data: { token, platform: Platform.OS } }),
  unregister: (token: string) =>
    apiRequest<{ registered: boolean }>({ method: 'DELETE', url: '/users/devices', data: { token } }),
};
