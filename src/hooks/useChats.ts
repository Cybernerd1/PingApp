import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatsApi } from '../api/chats';
import { isApiError } from '../api/types';

export function useChats(limit: number = 20, offset: number = 0) {
  const queryClient = useQueryClient();

  const chatsQuery = useQuery({
    queryKey: ['userChats', limit, offset],
    queryFn: async () => {
      const res = await chatsApi.getChats(limit, offset);
      if (isApiError(res)) throw new Error(res.message);
      return res.data || [];
    },
  });

  const uploadMediaMutation = useMutation({
    mutationFn: ({ chatId, formData }: { chatId: string; formData: FormData }) =>
      chatsApi.uploadMedia(chatId, formData),
  });

  return {
    chats: chatsQuery.data || [],
    isLoadingChats: chatsQuery.isLoading,
    chatsError: chatsQuery.error,
    uploadMedia: uploadMediaMutation.mutateAsync,
    isUploadingMedia: uploadMediaMutation.isPending,
    refetchChats: chatsQuery.refetch,
  };
}

export function useChatMessages(chatId: string | null) {
  const messagesQuery = useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: async () => {
      if (!chatId) return [];
      const res = await chatsApi.getMessages(chatId);
      if (isApiError(res)) throw new Error(res.message);
      return res.data?.messages || [];
    },
    enabled: !!chatId,
  });

  return {
    messages: messagesQuery.data || [],
    isLoadingMessages: messagesQuery.isLoading,
    messagesError: messagesQuery.error,
    refetchMessages: messagesQuery.refetch,
  };
}
