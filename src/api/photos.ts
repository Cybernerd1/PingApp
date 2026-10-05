import { apiRequest } from './client';
import { ApiResponse, ProfilePhoto } from './types';

export const photosApi = {
  getPhotos: async (): Promise<ApiResponse<{ photos: ProfilePhoto[] }>> => {
    return apiRequest<{ photos: ProfilePhoto[] }>({
      method: 'GET',
      url: '/users/photos',
    });
  },

  uploadPhotos: async (
    formData: FormData
  ): Promise<ApiResponse<{ photos: ProfilePhoto[] }>> => {
    return apiRequest<{ photos: ProfilePhoto[] }>({
      method: 'POST',
      url: '/users/photos',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deletePhoto: async (
    photoId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> => {
    return apiRequest<{ deleted: boolean }>({
      method: 'DELETE',
      url: '/users/photos',
      data: { photo_id: photoId },
    });
  },

  setProfilePicture: async (
    photoId: string
  ): Promise<ApiResponse<{ photo_id: string }>> => {
    return apiRequest<{ photo_id: string }>({
      method: 'PUT',
      url: '/users/photos/profile-picture',
      data: { photo_id: photoId },
    });
  },
};
