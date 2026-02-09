'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, UserCheck, Flame, Loader2 } from 'lucide-react';
import { insightsApi, type DashboardInsights as DashboardInsightsData } from '@/lib/api/insights';

export function DashboardInsights() {
    const t = useTranslations('admin.dashboard');

    const { data, isLoading, error } = useQuery<DashboardInsightsData>({
        queryKey: ['dashboard-insights'],
        queryFn: () => insightsApi.getDashboardInsights(),
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return null; // Silently fail, dashboard still works
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
                {t('insights', { defaultMessage: 'Insights' })}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Top Purchased Course Card */}
                <Card className="border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Trophy className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                {t('topPurchasedCourse', { defaultMessage: 'Top Course' })}
                            </span>
                        </div>
                        {data?.topPurchasedCourse ? (
                            <div className="space-y-2">
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-2">
                                    {data.topPurchasedCourse.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-amber-500">
                                        {data.topPurchasedCourse.purchasesCount}
                                    </span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {t('purchases', { defaultMessage: 'Purchases' })}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400 dark:text-slate-500 text-sm">
                                {t('noTopCourse', { defaultMessage: 'No purchases yet' })}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Newest Student Card */}
                <Card className="border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <UserCheck className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                {t('newestStudent', { defaultMessage: 'Newest Student' })}
                            </span>
                        </div>
                        {data?.newestStudent ? (
                            <div className="space-y-2">
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                                    {data.newestStudent.fullName}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                    {data.newestStudent.email}
                                </p>
                                <p className="text-xs text-emerald-500 font-medium">
                                    {formatDate(data.newestStudent.createdAt)}
                                </p>
                            </div>
                        ) : (
                            <p className="text-slate-400 dark:text-slate-500 text-sm">
                                {t('noNewStudent', { defaultMessage: 'No students yet' })}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Top Engaged Students Card */}
                <Card className="border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                                <Flame className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                {t('topEngaged', { defaultMessage: 'Top Engaged' })}
                            </span>
                        </div>
                        {data?.topEngagedStudents && data.topEngagedStudents.length > 0 ? (
                            <div className="space-y-3">
                                {data.topEngagedStudents.map((student, i) => (
                                    <div key={student.userId} className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                                                {student.fullName}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {student.avgCompletionPercentage}% {t('engagement', { defaultMessage: 'completion' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 dark:text-slate-500 text-sm">
                                {t('noEngagement', { defaultMessage: 'No data yet' })}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
