import { useMutation, useQueryClient } from '@tanstack/react-query';
import { interactionsApi } from '../api/interactions';
import { SwipeRequest } from '../api/types';

export function useInteractions() {
  const queryClient = useQueryClient();

  const swipeMutation = useMutation({
    mutationFn: (payload: SwipeRequest) => interactionsApi.swipe(payload),
    onSuccess: () => {
      // Invalidate candidates so refreshed stack excludes swiped users
      queryClient.invalidateQueries({ queryKey: ['discoverStack'] });
    },
  });

  const undoLikeMutation = useMutation({
    mutationFn: (targetUserId: string) => interactionsApi.undoLike(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoverStack'] });
    },
  });

  const undoDislikeMutation = useMutation({
    mutationFn: (targetUserId: string) => interactionsApi.undoDislike(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoverStack'] });
    },
  });

  return {
    swipe: swipeMutation.mutateAsync,
    isSwiping: swipeMutation.isPending,
    swipeError: swipeMutation.error,
    undoLike: undoLikeMutation.mutateAsync,
    isUndoingLike: undoLikeMutation.isPending,
    undoDislike: undoDislikeMutation.mutateAsync,
    isUndoingDislike: undoDislikeMutation.isPending,
  };
}
