import apiClient from '@/lib/api-client';
import type { LoginInput, LoginResponse, User } from '@/types/api';

export const authApi = {
  login: async (credentials: LoginInput) => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  refresh: async () => {
    return apiClient.post<{ accessToken: string }>('/auth/refresh');
  },

  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  getMe: async () => {
    return apiClient.get<User>('/auth/me');
  },

  updateProfile: async (data: { firstName: string; lastName: string; phoneNumber?: string; bio?: string }) => {
    return apiClient.put<User>('/auth/profile', data);
  },

  changePassword: async (data: any) => {
    return apiClient.post('/auth/change-password', data);
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ url: string }>('/users/me/avatar', formData);
  },
};

