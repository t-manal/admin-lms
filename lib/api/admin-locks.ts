import { apiClient } from '@/lib/api-client';

interface LockToggleResult {
    partId: string;
    isLocked: boolean;
}

export const adminLocksApi = {
    toggleLock: async (enrollmentId: string, partId: string): Promise<LockToggleResult> => {
        return apiClient.post<LockToggleResult>('/admin/locks/toggle', { enrollmentId, partId });
    },

    getLocks: async (enrollmentId: string): Promise<{ partId: string; isLocked: boolean }[]> => {
        return apiClient.get<{ partId: string; isLocked: boolean }[]>(`/admin/locks/${enrollmentId}`);
    }
};
