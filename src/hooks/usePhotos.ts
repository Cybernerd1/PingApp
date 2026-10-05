import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { photosApi } from '../api/photos';
import { isApiError } from '../api/types';

export function usePhotos() {
  const queryClient = useQueryClient();

  const photosQuery = useQuery({
    queryKey: ['userPhotos'],
    queryFn: async () => {
      const res = await photosApi.getPhotos();
      if (isApiError(res)) throw new Error(res.message);
      return res.data?.photos || [];
    },
  });

  const uploadPhotosMutation = useMutation({
    mutationFn: (formData: FormData) => photosApi.uploadPhotos(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhotos'] });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: string) => photosApi.deletePhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhotos'] });
    },
  });

  const setProfilePictureMutation = useMutation({
    mutationFn: (photoId: string) => photosApi.setProfilePicture(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhotos'] });
    },
  });

  return {
    photos: photosQuery.data || [],
    isLoadingPhotos: photosQuery.isLoading,
    uploadPhotos: uploadPhotosMutation.mutateAsync,
    isUploadingPhotos: uploadPhotosMutation.isPending,
    deletePhoto: deletePhotoMutation.mutateAsync,
    isDeletingPhoto: deletePhotoMutation.isPending,
    setProfilePicture: setProfilePictureMutation.mutateAsync,
    isSettingProfilePicture: setProfilePictureMutation.isPending,
  };
}
