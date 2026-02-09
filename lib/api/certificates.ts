import apiClient from '@/lib/api-client';

export interface CertificateRequest {
    id: string;
    studentId: string;
    courseId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    student: {
        firstName: string;
        lastName: string;
        email: string;
    };
    course: {
        title: string;
    };
    createdAt: string;
}

export const certificateApi = {
    getPendingRequests: async () => {
        return apiClient.get<CertificateRequest[]>('/certificates/instructor/pending');
    },

    updateRequestStatus: async (id: string, status: 'APPROVED' | 'REJECTED') => {
        return apiClient.patch(`/certificates/instructor/${id}`, { status });
    },
};
