import { apiRequest } from './client';
import { ApiResponse, AssistantHistory, AssistantReply } from './types';

/** Ping Assistant — server-side bot (OpenRouter, with a built-in fallback). */
export const assistantApi = {
  getMessages: (limit = 50): Promise<ApiResponse<AssistantHistory>> =>
    apiRequest<AssistantHistory>({ method: 'GET', url: `/assistant/messages?limit=${limit}` }),

  send: (content: string): Promise<ApiResponse<AssistantReply>> =>
    apiRequest<AssistantReply>({ method: 'POST', url: '/assistant/messages', data: { content }, timeout: 45_000 }),

  clear: (): Promise<ApiResponse<{ cleared: boolean }>> =>
    apiRequest<{ cleared: boolean }>({ method: 'DELETE', url: '/assistant/messages' }),
};
