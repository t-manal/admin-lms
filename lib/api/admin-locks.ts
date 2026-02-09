import { apiClient } from '@/lib/api-client';

export const adminLocksApi = {
    toggleLock: async (enrollmentId: string, partId: string) => {
        const { data } = await apiClient.post<any>('/admin/locks/toggle', { enrollmentId, partId });
        return data;
    },

    getLocks: async (enrollmentId: string) => {
        const { data } = await apiClient.get<{ data: { partId: string; isLocked: boolean }[] }>(`/admin/locks/${enrollmentId}`);
        return data;
    }
};
