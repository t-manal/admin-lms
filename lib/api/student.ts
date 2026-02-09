import apiClient from '@/lib/api-client';

export interface QuizQuestion {
    id: string;
    text: string;
    order: number;
    answers: {
        id: string;
        text: string;
    }[];
}

export interface Quiz {
    id: string;
    title: string;
    passingScore: number;
    questions: QuizQuestion[];
}

export const studentApi = {
    getMyCourses: async () => {
        return apiClient.get<any[]>('/students/me/courses');
    },
    getMyCertificates: async () => {
        return apiClient.get<any[]>('/students/me/certificates');
    },
    getQuiz: async (assetId: string) => {
        return apiClient.get<Quiz>(`/courses/assets/${assetId}/quiz`);
    },
    submitQuiz: async (assetId: string, answers: { questionId: string, answerId: string }[]) => {
        return apiClient.post<{
            passed: boolean,
            score: number,
            passingScore: number,
            attempt: any
        }>(`/courses/assets/${assetId}/quiz/submit`, { answers });
    },
    getStudentFullDetails: async (studentId: string) => {
        return apiClient.get<any>(`/students/admin/students/${studentId}/full-details`);
    },

};
