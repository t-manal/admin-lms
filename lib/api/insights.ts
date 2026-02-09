import apiClient from '@/lib/api-client';

export interface TopPurchasedCourse {
    courseId: string;
    title: string;
    purchasesCount: number;
}

export interface NewestStudent {
    userId: string;
    fullName: string;
    email: string;
    createdAt: string;
}

export interface EngagedStudent {
    userId: string;
    fullName: string;
    purchasedCoursesCount: number;
    avgCompletionPercentage: number;
    engagementScore: number;
}

export interface DashboardInsights {
    topPurchasedCourse: TopPurchasedCourse | null;
    newestStudent: NewestStudent | null;
    topEngagedStudents: EngagedStudent[];
}

export const insightsApi = {
    getDashboardInsights: async () => {
        return apiClient.get<DashboardInsights>('/admin/dashboard/insights');
    }
};
