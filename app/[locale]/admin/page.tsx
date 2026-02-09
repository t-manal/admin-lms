'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { instructorApi } from '@/lib/api/instructor';
import { financeApi } from '@/lib/api/finance';
import { DashboardHeader } from '@/components/admin/dashboard/DashboardHeader';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { ActivityFeed } from '@/components/admin/dashboard/ActivityFeed';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';
import { DashboardInsights } from '@/components/admin/dashboard/DashboardInsights';
import { Loader2 } from 'lucide-react';
import { isAdminPanelRole } from '@/lib/rbac';

// Helper to handle both old (Array) and new ({ data, meta }) response shapes during migration
const handlePaginatedResponse = (res: any) => {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
};

export default function DashboardPage() {
  const t = useTranslations('admin.dashboard');
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [data, setData] = useState({
    payments: [] as any[],
    students: [] as any[],
    totalRevenue: 0,
    revenueSeries: [] as any[] // Add series state
  });
  const [loading, setLoading] = useState(true);

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push(`/${locale}/login`);
    } else if (!isAuthLoading && user && !isAdminPanelRole(user.role)) {
      router.push(`/${locale}/login`);
    }
  }, [user, isAuthLoading, router, locale]);

  // Data Fetching
  useEffect(() => {
    if (user && isAdminPanelRole(user.role)) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [paymentsRes, studentsRes, revenueRes] = await Promise.all([
            financeApi.getPayments({ limit: 20 }), // Limit reduced significantly, only needed for Activity Feed
            instructorApi.getStudents({ limit: 5 }), // Only need recent 5 for dashboard
            financeApi.getRevenueSummary() // New endpoint
          ]);

          // Extract payments safely based on financeApi response structure
          const paymentsList = (paymentsRes as any).payments || (Array.isArray(paymentsRes) ? paymentsRes : []);
          
          // Extract students from new pagination structure
          const studentList = handlePaginatedResponse(studentsRes); // Helper logic inline or just check

          setData({
            payments: paymentsList,
            students: studentList,
            totalRevenue: revenueRes.totalRevenue, // Use server-side total
            revenueSeries: revenueRes.series // Use server-side series
          });
        } catch (error) {
          console.error('Dashboard data fetch failed:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  if (isAuthLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdminPanelRole(user.role)) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* 1. Hero / Header */}
      <DashboardHeader
        totalRevenue={data.totalRevenue}
        userName={user.firstName}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Financial Pulse Chart */}
        <RevenueChart series={data.revenueSeries} />

        {/* 3. Live Operations Feed */}
        <ActivityFeed
          payments={data.payments}
          students={data.students}
        />
      </div>

      {/* 4. Insights Section */}
      <DashboardInsights />

      {/* 5. Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full"></span>
          {t('quickLaunchpad')}
        </h3>
        <QuickActions />
      </div>
    </div>
  );
}

