import { apiRequest } from './client';
import {
  ApiResponse,
  ChatConversation,
  ChatMessage,
  UploadMediaResponse,
} from './types';

export const chatsApi = {
  getChats: async (
    limit: number = 20,
    offset: number = 0
  ): Promise<ApiResponse<ChatConversation[]>> => {
    return apiRequest<ChatConversation[]>({
      method: 'GET',
      url: `/chats?limit=${limit}&offset=${offset}`,
    });
  },

  getMessages: async (
    chatId: string
  ): Promise<ApiResponse<{ chat_id: string; messages: ChatMessage[]; total: number }>> => {
    return apiRequest<{ chat_id: string; messages: ChatMessage[]; total: number }>({
      method: 'GET',
      url: `/chats/${chatId}/messages`,
    });
  },

  uploadMedia: async (
    chatId: string,
    formData: FormData
  ): Promise<ApiResponse<UploadMediaResponse>> => {
    return apiRequest<UploadMediaResponse>({
      method: 'POST',
      url: `/chats/${chatId}/media`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
